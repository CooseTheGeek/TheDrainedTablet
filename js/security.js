// SECURITY SYSTEM - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek)

class SecuritySystem {
    constructor() {
        this.tablet = window.drainedTablet;
        this.currentCode = '';
        this.attempts = 3;
        this.locked = false;
        this.lockTime = null;
        
        this.init();
    }

    init() {
        this.setupNumpad();
        this.setupButtons();
        this.loadCodeDisplay();
    }

    setupNumpad() {
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.locked) {
                    this.tablet.showError('Door is locked. Try again later.');
                    return;
                }
                
                const num = e.target.innerText;
                
                if (num === 'C') {
                    this.clearCode();
                } else if (num === 'E') {
                    this.submitCode();
                } else {
                    this.addDigit(num);
                }
            });
        });
    }

    setupButtons() {
        // Already handled by numpad
    }

    loadCodeDisplay() {
        const display = document.querySelector('.code-display');
        if (display) {
            display.innerText = '';
        }
    }

    addDigit(digit) {
        if (this.currentCode.length < 4) {
            this.currentCode += digit;
            this.updateDisplay();
        }
    }

    clearCode() {
        this.currentCode = '';
        this.updateDisplay();
    }

    updateDisplay() {
        const display = document.querySelector('.code-display');
        if (display) {
            display.innerText = '*'.repeat(this.currentCode.length);
        }
    }

    async submitCode() {
        if (this.currentCode.length !== 4) {
            this.tablet.showError('Enter 4-digit code');
            return;
        }

        const success = await this.tablet.unlockDoor(this.currentCode);
        
        if (success) {
            this.attempts = 3;
            this.clearCode();
            document.getElementById('attempts').innerText = '3 attempts remaining';
        } else {
            this.attempts--;
            document.getElementById('attempts').innerText = `${this.attempts} attempts remaining`;
            this.clearCode();
            
            if (this.attempts <= 0) {
                this.lockDoor();
            }
        }
    }

    lockDoor() {
        this.locked = true;
        this.lockTime = Date.now();
        
        const doorContent = document.querySelector('.door-content');
        doorContent.innerHTML = `
            <h1>🔒 LOCKED 🔒</h1>
            <p>Too many failed attempts</p>
            <p>Locked for 15 minutes</p>
            <p>Contact master: CooseTheGeek</p>
            <button class="num-btn" onclick="location.reload()">RELOAD</button>
        `;
        
        // Auto-unlock after 15 minutes
        setTimeout(() => {
            this.locked = false;
            this.attempts = 3;
            location.reload();
        }, 15 * 60 * 1000);
    }

    changeCode(username, newCode, masterUser) {
        if (!this.tablet.isMaster() && masterUser !== 'CooseTheGeek') {
            this.tablet.showError('Only masters can change codes');
            return false;
        }

        const users = this.tablet.loadUsers();
        if (!users[username]) {
            this.tablet.showError('User not found');
            return false;
        }

        if (newCode.length !== 4 || isNaN(newCode)) {
            this.tablet.showError('Code must be 4 digits');
            return false;
        }

        users[username].code = newCode;
        this.tablet.saveUsers(users);
        this.tablet.showToast(`Code changed for ${username}`, 'success');
        return true;
    }

    addUser(username, code, level, masterUser) {
        if (!this.tablet.isMaster() && masterUser !== 'CooseTheGeek') {
            this.tablet.showError('Only masters can add users');
            return false;
        }

        const users = this.tablet.loadUsers();
        if (users[username]) {
            this.tablet.showError('User already exists');
            return false;
        }

        if (code.length !== 4 || isNaN(code)) {
            this.tablet.showError('Code must be 4 digits');
            return false;
        }

        users[username] = {
            code: code,
            level: level || 'user',
            created: new Date().toISOString(),
            createdBy: masterUser
        };

        this.tablet.saveUsers(users);
        this.tablet.showToast(`User ${username} added`, 'success');
        return true;
    }

    removeUser(username, masterUser) {
        if (!this.tablet.isMaster() && masterUser !== 'CooseTheGeek') {
            this.tablet.showError('Only masters can remove users');
            return false;
        }

        if (username === 'CooseTheGeek') {
            this.tablet.showError('Cannot remove primary master');
            return false;
        }

        const users = this.tablet.loadUsers();
        if (!users[username]) {
            this.tablet.showError('User not found');
            return false;
        }

        delete users[username];
        this.tablet.saveUsers(users);
        this.tablet.showToast(`User ${username} removed`, 'info');
        return true;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.securitySystem = new SecuritySystem();
});
