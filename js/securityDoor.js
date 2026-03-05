// SECURITY DOOR SYSTEM - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class SecurityDoor {
    constructor(tablet) {
        this.tablet = tablet;
        this.attempts = 3;
        this.locked = false;
        this.lockTime = null;
        this.currentCode = '';
        this.accessLog = this.loadLog();
        this.init();
    }

    loadLog() {
        const saved = localStorage.getItem('drained_security_log');
        return saved ? JSON.parse(saved) : [];
    }

    saveLog() {
        localStorage.setItem('drained_security_log', JSON.stringify(this.accessLog));
    }

    init() {
        this.setupDoor();
        this.setupEventListeners();
    }

    setupDoor() {
        // Door already exists in HTML
        this.updateDisplay();
    }

    setupEventListeners() {
        // Numpad buttons
        document.querySelectorAll('.numpad-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.locked) return;
                const num = e.target.dataset.num;
                this.handleNumpad(num);
            });
        });

        document.getElementById('unlock-btn')?.addEventListener('click', () => this.tryUnlock());
        document.getElementById('clear-btn')?.addEventListener('click', () => this.clearCode());
        document.getElementById('forgot-btn')?.addEventListener('click', () => this.forgotCode());

        // Quick admin override (for testing)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'm') {
                this.masterOverride();
            }
        });
    }

    handleNumpad(num) {
        if (num === 'C') {
            this.clearCode();
            return;
        }

        if (num === 'E') {
            this.tryUnlock();
            return;
        }

        if (this.currentCode.length < 4) {
            this.currentCode += num;
            this.updateDisplay();
        }
    }

    clearCode() {
        this.currentCode = '';
        this.updateDisplay();
    }

    updateDisplay() {
        const dots = document.querySelectorAll('.dot');
        for (let i = 0; i < dots.length; i++) {
            if (i < this.currentCode.length) {
                dots[i].style.backgroundColor = '#FFB100';
                dots[i].style.boxShadow = '0 0 10px #FFB100';
            } else {
                dots[i].style.backgroundColor = '#333';
                dots[i].style.boxShadow = 'none';
            }
        }
    }

    tryUnlock() {
        if (this.locked) {
            this.tablet.showError('Door is locked. Please wait.');
            return;
        }

        if (this.currentCode.length !== 4) {
            this.tablet.showError('Enter 4-digit code');
            return;
        }

        // Check against stored users
        let valid = false;
        let user = null;

        // Primary masters
        if (this.currentCode === '10325') {
            valid = true;
            user = 'CooseTheGeek';
        } else if (this.currentCode === '2026') {
            valid = true;
            user = 'Casey';
        } else {
            // Check other users
            for (let [username, data] of Object.entries(this.tablet.users)) {
                if (data.code === this.currentCode) {
                    valid = true;
                    user = username;
                    break;
                }
            }
        }

        // Log attempt
        this.logAccess(user || 'Unknown', valid ? 'SUCCESS' : 'FAILED');

        if (valid) {
            this.unlockDoor(user);
        } else {
            this.failedAttempt();
        }
    }

    unlockDoor(user) {
        this.attempts = 3;
        document.getElementById('attempts').innerText = '3 attempts remaining';
        document.getElementById('last-attempt').innerText = 'Last: Successful - ' + new Date().toLocaleTimeString();
        
        // Hide door
        document.getElementById('security-door').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        
        // Set current user
        this.tablet.currentUser = user;
        this.tablet.userLevel = this.tablet.users[user]?.level || 'user';
        document.getElementById('current-user').innerText = user;
        
        this.tablet.showToast(`Welcome, ${user}!`, 'success');
        this.clearCode();

        // Auto-connect to server if configured
        setTimeout(() => {
            if (this.tablet.autoConnect) {
                this.tablet.connectToServer();
            }
        }, 1000);
    }

    failedAttempt() {
        this.attempts--;
        document.getElementById('attempts').innerText = this.attempts + ' attempts remaining';
        document.getElementById('last-attempt').innerText = 'Last: Failed - ' + new Date().toLocaleTimeString();
        
        this.tablet.showError('Invalid code');
        this.clearCode();

        if (this.attempts <= 0) {
            this.lockDoor();
        }
    }

    lockDoor() {
        this.locked = true;
        this.lockTime = Date.now();

        const doorContent = document.querySelector('.door-container');
        doorContent.innerHTML = `
            <div class="door-header">
                <h1>🔒 DOOR LOCKED 🔒</h1>
                <p>Too many failed attempts</p>
            </div>
            <div class="lock-message">
                <p>Locked for 15 minutes</p>
                <p>Contact master: CooseTheGeek</p>
                <button class="door-btn" onclick="location.reload()">RELOAD</button>
            </div>
        `;

        this.logAccess('SYSTEM', 'LOCKED');
    }

    masterOverride() {
        this.locked = false;
        this.attempts = 3;
        this.unlockDoor('CooseTheGeek');
        this.tablet.showToast('Master override activated', 'warning');
    }

    forgotCode() {
        this.tablet.showConfirm('Contact master CooseTheGeek for code reset?', (confirmed) => {
            if (confirmed) {
                this.tablet.showToast('Master has been notified', 'info');
                this.logAccess('SYSTEM', 'FORGOT_CODE');
            }
        });
    }

    logAccess(user, status) {
        this.accessLog.unshift({
            time: new Date().toISOString(),
            user: user,
            status: status,
            code: this.currentCode ? '****' : ''
        });

        if (this.accessLog.length > 100) {
            this.accessLog.pop();
        }

        this.saveLog();
    }

    getLog() {
        return this.accessLog;
    }

    changeCode(username, newCode, masterUser) {
        if (masterUser !== 'CooseTheGeek' && this.tablet.userLevel !== 'master') {
            return false;
        }

        if (!this.tablet.users[username]) {
            return false;
        }

        if (newCode.length !== 4 || isNaN(newCode)) {
            return false;
        }

        this.tablet.users[username].code = newCode;
        this.tablet.saveUsers();
        this.logAccess(masterUser, 'CODE_CHANGE');
        return true;
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.securityDoor = new SecurityDoor(window.drainedTablet);
});