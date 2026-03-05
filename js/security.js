// SECURITY SYSTEM - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class SecuritySystem {
    constructor(tablet) {
        this.tablet = tablet;
        this.master = 'CooseTheGeek';
        this.attempts = 0;
        this.maxAttempts = 3;
        this.locked = false;
        this.lockTime = null;
        this.currentCode = '';
        this.accessLogs = this.loadLogs();
        this.activeSessions = {};
        this.setupDoor();
    }

    loadLogs() {
        const saved = localStorage.getItem('drained_access_logs');
        return saved ? JSON.parse(saved) : [];
    }

    saveLogs() {
        localStorage.setItem('drained_access_logs', JSON.stringify(this.accessLogs));
    }

    setupDoor() {
        // Create security door HTML if not present
        if (!document.getElementById('security-door')) {
            this.createDoorHTML();
        }

        // Setup numpad listeners
        document.querySelectorAll('.numpad-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.locked) {
                    this.tablet.showError('Door is locked. Contact master.');
                    return;
                }
                const num = e.target.dataset.num;
                this.handleInput(num);
            });
        });

        // Action buttons
        document.getElementById('unlock-btn')?.addEventListener('click', () => this.attemptUnlock());
        document.getElementById('clear-btn')?.addEventListener('click', () => this.clearInput());
        document.getElementById('forgot-btn')?.addEventListener('click', () => this.forgotCode());

        // Check if door was previously locked
        this.checkLockStatus();
    }

    createDoorHTML() {
        const doorHTML = `
            <div id="security-door" class="security-door">
                <div class="door-container">
                    <div class="door-header">
                        <h1>⎔ DRAINED TABLET ⎔</h1>
                        <p>ENTER ACCESS CODE</p>
                    </div>
                    
                    <div class="door-numpad">
                        <div class="numpad-row">
                            <button class="numpad-btn" data-num="7">7</button>
                            <button class="numpad-btn" data-num="8">8</button>
                            <button class="numpad-btn" data-num="9">9</button>
                        </div>
                        <div class="numpad-row">
                            <button class="numpad-btn" data-num="4">4</button>
                            <button class="numpad-btn" data-num="5">5</button>
                            <button class="numpad-btn" data-num="6">6</button>
                        </div>
                        <div class="numpad-row">
                            <button class="numpad-btn" data-num="1">1</button>
                            <button class="numpad-btn" data-num="2">2</button>
                            <button class="numpad-btn" data-num="3">3</button>
                        </div>
                        <div class="numpad-row">
                            <button class="numpad-btn" data-num="C">C</button>
                            <button class="numpad-btn" data-num="0">0</button>
                            <button class="numpad-btn" data-num="E">E</button>
                        </div>
                    </div>
                    
                    <div class="door-display">
                        <div class="code-dots" id="code-dots">
                            <span class="dot"></span>
                            <span class="dot"></span>
                            <span class="dot"></span>
                            <span class="dot"></span>
                        </div>
                        <div class="attempts" id="attempts">3 attempts remaining</div>
                        <div class="last-attempt" id="last-attempt">Last: --</div>
                    </div>
                    
                    <div class="door-footer">
                        <button class="door-btn" id="unlock-btn">UNLOCK</button>
                        <button class="door-btn" id="clear-btn">CLEAR</button>
                        <button class="door-btn" id="forgot-btn">FORGOT CODE?</button>
                    </div>
                    
                    <div class="master-override">
                        <p>Master Control: <span class="master-name">CooseTheGeek</span></p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('afterbegin', doorHTML);
    }

    handleInput(num) {
        if (this.currentCode.length < 4) {
            this.currentCode += num;
            this.updateDisplay();
        }
    }

    clearInput() {
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

    attemptUnlock() {
        if (this.locked) {
            this.tablet.showError('Door is locked. Please wait ' + this.getLockTimeRemaining() + ' minutes.');
            return;
        }

        if (this.currentCode.length !== 4) {
            this.tablet.showError('Please enter a 4-digit code');
            return;
        }

        // Log attempt
        this.logAccess('UNLOCK_ATTEMPT', this.currentCode, 'pending');

        // Check against users
        let valid = false;
        let user = null;

        for (let [username, data] of Object.entries(this.tablet.users)) {
            if (data.code === this.currentCode) {
                valid = true;
                user = username;
                break;
            }
        }

        // Master override
        if (this.currentCode === 'COOSE2026') {
            valid = true;
            user = 'CooseTheGeek';
        }

        if (valid) {
            this.unlockSuccess(user);
        } else {
            this.unlockFailed();
        }
    }

    unlockSuccess(user) {
        this.attempts = 0;
        document.getElementById('attempts').innerText = '3 attempts remaining';
        document.getElementById('last-attempt').innerText = 'Last: Successful - ' + new Date().toLocaleTimeString();
        
        // Log success
        this.logAccess('UNLOCK_SUCCESS', this.currentCode, 'success', user);
        
        // Create session
        const sessionId = 'sess_' + Math.random().toString(36).substring(2, 10);
        this.activeSessions[sessionId] = {
            user: user,
            loginTime: new Date().toISOString(),
            lastActive: Date.now(),
            ip: 'local'
        };
        
        // Store session
        localStorage.setItem('drained_session', JSON.stringify({
            username: user,
            expires: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
        }));
        
        // Unlock door
        document.getElementById('security-door').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('current-user').innerText = user;
        
        // Set current user in tablet
        this.tablet.currentUser = user;
        this.tablet.userLevel = this.tablet.users[user]?.level || 'user';
        
        this.tablet.showToast('Welcome, ' + user, 'success');
        this.clearInput();
    }

    unlockFailed() {
        this.attempts++;
        const remaining = this.maxAttempts - this.attempts;
        document.getElementById('attempts').innerText = remaining + ' attempts remaining';
        document.getElementById('last-attempt').innerText = 'Last: Failed - ' + new Date().toLocaleTimeString();
        
        // Log failure
        this.logAccess('UNLOCK_FAILED', this.currentCode, 'failed');
        
        this.tablet.showError('Invalid code');
        this.clearInput();

        if (this.attempts >= this.maxAttempts) {
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
                <p>Locked until: <span id="lock-timer">15:00</span></p>
                <p>Contact master: CooseTheGeek</p>
                <button class="door-btn" onclick="location.reload()">RELOAD</button>
            </div>
        `;
        
        this.startLockTimer();
        this.logAccess('DOOR_LOCKED', '', 'lock');
    }

    startLockTimer() {
        const timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.lockTime) / 1000 / 60);
            if (elapsed >= 15) {
                this.locked = false;
                this.attempts = 0;
                clearInterval(timer);
                location.reload();
            } else {
                const remaining = 15 - elapsed;
                const timerEl = document.getElementById('lock-timer');
                if (timerEl) {
                    timerEl.innerText = remaining.toString().padStart(2, '0') + ':00';
                }
            }
        }, 1000);
    }

    getLockTimeRemaining() {
        if (!this.lockTime) return 0;
        return 15 - Math.floor((Date.now() - this.lockTime) / 1000 / 60);
    }

    forgotCode() {
        this.tablet.showConfirm('Contact master CooseTheGeek for code reset?', (confirmed) => {
            if (confirmed) {
                this.tablet.showToast('Master has been notified', 'info');
                this.logAccess('FORGOT_CODE', '', 'info');
            }
        });
    }

    logAccess(action, code, status, user = null) {
        this.accessLogs.unshift({
            timestamp: new Date().toISOString(),
            action: action,
            code: code ? '*'.repeat(code.length) : '',
            status: status,
            user: user || 'unknown',
            attempts: this.attempts
        });
        
        // Keep only last 100 logs
        if (this.accessLogs.length > 100) {
            this.accessLogs.pop();
        }
        
        this.saveLogs();
    }

    getAccessLogs() {
        return this.accessLogs;
    }

    getActiveSessions() {
        // Clean expired sessions
        const now = Date.now();
        Object.keys(this.activeSessions).forEach(sessionId => {
            if (now - this.activeSessions[sessionId].lastActive > 8 * 60 * 60 * 1000) {
                delete this.activeSessions[sessionId];
            }
        });
        
        return this.activeSessions;
    }

    terminateSession(sessionId, masterUser) {
        if (masterUser !== 'CooseTheGeek' && this.tablet.userLevel !== 'master') {
            this.tablet.showError('Only masters can terminate sessions');
            return false;
        }
        
        if (this.activeSessions[sessionId]) {
            const user = this.activeSessions[sessionId].user;
            delete this.activeSessions[sessionId];
            this.logAccess('SESSION_TERMINATED', '', 'success', masterUser);
            this.tablet.showToast('Session for ' + user + ' terminated', 'success');
            return true;
        }
        
        return false;
    }

    changeUserCode(username, newCode, masterUser) {
        if (masterUser !== 'CooseTheGeek' && this.tablet.userLevel !== 'master') {
            this.tablet.showError('Only masters can change codes');
            return false;
        }
        
        if (!this.tablet.users[username]) {
            this.tablet.showError('User not found');
            return false;
        }
        
        if (newCode.length !== 4 || !/^\d+$/.test(newCode)) {
            this.tablet.showError('Code must be 4 digits');
            return false;
        }
        
        this.tablet.users[username].code = newCode;
        this.tablet.saveUsers();
        this.logAccess('CODE_CHANGED', newCode, 'success', masterUser);
        this.tablet.showToast('Code changed for ' + username, 'success');
        return true;
    }

    addUser(username, code, level, masterUser) {
        if (masterUser !== 'CooseTheGeek' && this.tablet.userLevel !== 'master') {
            this.tablet.showError('Only masters can add users');
            return false;
        }
        
        if (this.tablet.users[username]) {
            this.tablet.showError('User already exists');
            return false;
        }
        
        if (code.length !== 4 || !/^\d+$/.test(code)) {
            this.tablet.showError('Code must be 4 digits');
            return false;
        }
        
        this.tablet.users[username] = {
            code: code,
            level: level || 'user',
            created: new Date().toISOString(),
            createdBy: masterUser
        };
        
        this.tablet.saveUsers();
        this.logAccess('USER_ADDED', code, 'success', masterUser);
        this.tablet.showToast('User ' + username + ' added', 'success');
        return true;
    }

    removeUser(username, masterUser) {
        if (masterUser !== 'CooseTheGeek' && this.tablet.userLevel !== 'master') {
            this.tablet.showError('Only masters can remove users');
            return false;
        }
        
        if (username === 'CooseTheGeek') {
            this.tablet.showError('Cannot remove primary master');
            return false;
        }
        
        if (!this.tablet.users[username]) {
            this.tablet.showError('User not found');
            return false;
        }
        
        delete this.tablet.users[username];
        this.tablet.saveUsers();
        this.logAccess('USER_REMOVED', '', 'success', masterUser);
        this.tablet.showToast('User ' + username + ' removed', 'success');
        return true;
    }

    checkLockStatus() {
        const lockedUntil = localStorage.getItem('door_locked_until');
        if (lockedUntil && Date.now() < parseInt(lockedUntil)) {
            this.locked = true;
            this.lockTime = parseInt(lockedUntil) - (15 * 60 * 1000);
            this.lockDoor();
        }
    }
}

// Initialize security when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    // Will be initialized by tablet
});