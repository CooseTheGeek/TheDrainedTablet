// security.js – DRAINED TABLET ULTIMATE v7.0.0
// Complete rework: Discord OAuth linking, PIN creation, and secure login.

class Security {
    constructor() {
        this.auth = window.authSystem;
        this.currentPin = '';
        this.attempts = 3;
        this.locked = false;
        this.lockTime = null;
        this.pendingDiscordUser = null;
        this.init();
    }

    init() {
        this.setupNumpad();
        this.setupButtons();
        this.updateDisplay();
        this.checkPendingDiscord();
    }

    setupNumpad() {
        document.querySelectorAll('.numpad-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.locked) {
                    toast.error('Door is locked. Try again later.');
                    return;
                }
                const num = e.target.innerText;
                if (num === 'C') {
                    this.clearPin();
                } else if (num === 'E') {
                    this.submitPin();
                } else {
                    this.addDigit(num);
                }
            });
        });
    }

    setupButtons() {
        document.getElementById('unlock-btn')?.addEventListener('click', () => this.submitPin());
        document.getElementById('clear-btn')?.addEventListener('click', () => this.clearPin());
    }

    addDigit(digit) {
        if (this.currentPin.length < 4) {
            this.currentPin += digit;
            this.updateDisplay();
        }
    }

    clearPin() {
        this.currentPin = '';
        this.updateDisplay();
    }

    updateDisplay() {
        const dots = document.querySelectorAll('.code-dots .dot');
        for (let i = 0; i < dots.length; i++) {
            if (i < this.currentPin.length) {
                dots[i].classList.add('filled');
            } else {
                dots[i].classList.remove('filled');
            }
        }
    }

    async submitPin() {
        if (this.currentPin.length !== 4) {
            toast.error('Enter 4-digit PIN');
            return;
        }

        try {
            const result = await this.auth.login(this.currentPin);
            if (result.success) {
                this.attempts = 3;
                this.clearPin();
                document.getElementById('attempts').innerText = '3 attempts remaining';
                
                AppState.user.role = result.role;
                AppState.user.username = result.username;
                document.getElementById('security-door').classList.add('hidden');
                document.getElementById('dashboard').classList.remove('hidden');
                
                const userEl = document.getElementById('profile-name');
                if (userEl) userEl.innerText = result.username;
                
                toast.success(`Welcome, ${result.username}!`);
                this.updateRoleBadge();
            } else {
                this.failedAttempt();
            }
        } catch (err) {
            toast.error(err.message);
            this.failedAttempt();
        }
    }

    failedAttempt() {
        this.attempts--;
        document.getElementById('attempts').innerText = `${this.attempts} attempts remaining`;
        toast.error('Invalid PIN');
        this.clearPin();
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
                <h1>🔒 LOCKED 🔒</h1>
                <p>Too many failed attempts</p>
            </div>
            <div class="lock-message">
                <p>Locked for 15 minutes</p>
                <p>Contact master: CooseTheGeek</p>
                <button class="door-btn" onclick="location.reload()">RELOAD</button>
            </div>
        `;
        setTimeout(() => {
            this.locked = false;
            this.attempts = 3;
            location.reload();
        }, 15 * 60 * 1000);
    }

    async checkPendingDiscord() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            try {
                const response = await this.exchangeDiscordCode(code);
                this.pendingDiscordUser = response.user;
                this.showPinCreationModal();
                window.history.replaceState({}, '', window.location.pathname);
            } catch (error) {
                toast.error('Discord authentication failed: ' + error.message);
            }
        }
    }

    async exchangeDiscordCode(code) {
        const response = await fetch('https://drained-bridge.onrender.com/api/discord/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        if (!response.ok) {
            throw new Error('Failed to authenticate with Discord');
        }
        return await response.json();
    }

    showPinCreationModal() {
        const modal = document.createElement('div');
        modal.id = 'pin-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>🔐 Set Your PIN</h3>
                <p>Welcome ${this.pendingDiscordUser.username}! Choose a 4-digit PIN to secure your account.</p>
                <div class="form-group">
                    <input type="password" id="new-pin" maxlength="4" placeholder="Enter 4-digit PIN" autocomplete="off">
                </div>
                <div class="modal-actions">
                    <button id="save-pin" class="modal-btn primary">Save PIN</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.classList.remove('hidden');
        
        document.getElementById('save-pin').addEventListener('click', async () => {
            const pin = document.getElementById('new-pin').value;
            if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
                toast.error('PIN must be 4 digits');
                return;
            }
            
            try {
                await this.auth.register(this.pendingDiscordUser.id, this.pendingDiscordUser.username, this.pendingDiscordUser.avatar, pin);
                modal.remove();
                toast.success('PIN set successfully! Please log in.');
            } catch (error) {
                toast.error(error.message);
            }
        });
    }

    updateRoleBadge() {
        const badge = document.getElementById('role-badge');
        if (badge && AppState.user?.role) {
            badge.className = `role-badge ${AppState.user.role}`;
            badge.innerText = AppState.user.role.toUpperCase();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.security = new Security();
});