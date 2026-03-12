// security.js – DRAINED TABLET ULTIMATE v7.0.0
// Security door and access control, with 2FA support.

class Security {
    constructor() {
        this.auth = window.authSystem;
        this.currentCode = '';
        this.attempts = 3;
        this.locked = false;
        this.lockTime = null;
        this.pendingUser = null;
        this.pendingRole = null;
        this.init();
    }

    init() {
        this.setupNumpad();
        this.setupButtons();
        this.updateDisplay();
        this.create2FAModal();
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
        document.getElementById('unlock-btn')?.addEventListener('click', () => this.submitCode());
        document.getElementById('clear-btn')?.addEventListener('click', () => this.clearCode());
        document.getElementById('forgot-btn')?.addEventListener('click', () => this.forgotCode());
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
        const dots = document.querySelectorAll('.dot');
        for (let i = 0; i < dots.length; i++) {
            if (i < this.currentCode.length) {
                dots[i].classList.add('filled');
            } else {
                dots[i].classList.remove('filled');
            }
        }
    }

    async submitCode() {
        if (this.currentCode.length !== 4) {
            toast.error('Enter 4-digit code');
            return;
        }

        try {
            const result = await this.auth.login(this.currentCode);
            if (result.success) {
                this.attempts = 3;
                this.clearCode();
                document.getElementById('attempts').innerText = '3 attempts remaining';
                
                // Unlock dashboard
                document.getElementById('security-door').classList.add('hidden');
                document.getElementById('dashboard').classList.remove('hidden');
                
                // Update user info in header
                const userEl = document.getElementById('profile-name');
                if (userEl) userEl.innerText = result.username;
                
                toast.success(`Welcome, ${result.username}!`);
            } else if (result.require2FA) {
                // Store pending user and show 2FA modal
                this.pendingUser = result.username;
                this.pendingRole = result.role;
                this.show2FAModal();
                this.clearCode(); // Clear code for security
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
        toast.error('Invalid code');
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
                <h1>🔒 LOCKED 🔒</h1>
                <p>Too many failed attempts</p>
            </div>
            <div class="lock-message">
                <p>Locked for 15 minutes</p>
                <p>Contact master: CooseTheGeek</p>
                <button class="door-btn" onclick="location.reload()">RELOAD</button>
            </div>
        `;
        // Auto-unlock after 15 minutes
        setTimeout(() => {
            this.locked = false;
            this.attempts = 3;
            location.reload();
        }, 15 * 60 * 1000);
    }

    forgotCode() {
        if (confirm('Contact master CooseTheGeek for code reset?')) {
            toast.info('Master has been notified');
        }
    }

    create2FAModal() {
        // Check if modal already exists
        if (document.getElementById('2fa-modal')) return;
        
        const modalHTML = `
            <div id="2fa-modal" class="modal hidden">
                <div class="modal-content">
                    <h3>🔐 Two-Factor Authentication</h3>
                    <p>Enter the 6-digit code from your authenticator app.</p>
                    <div class="form-group">
                        <input type="text" id="2fa-code" placeholder="123456" maxlength="6" pattern="\\d*">
                    </div>
                    <div class="checkbox-item">
                        <label>
                            <input type="checkbox" id="trust-device"> Trust this device for 30 days
                        </label>
                    </div>
                    <div class="modal-actions">
                        <button id="verify-2fa" class="modal-btn primary">Verify</button>
                        <button id="cancel-2fa" class="modal-btn">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('verify-2fa')?.addEventListener('click', () => this.verify2FA());
        document.getElementById('cancel-2fa')?.addEventListener('click', () => {
            document.getElementById('2fa-modal').classList.add('hidden');
            this.pendingUser = null;
        });
    }

    show2FAModal() {
        const modal = document.getElementById('2fa-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('2fa-code').focus();
        }
    }

    async verify2FA() {
        const code = document.getElementById('2fa-code').value.trim();
        if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
            toast.error('Enter a valid 6-digit code');
            return;
        }

        const trustDevice = document.getElementById('trust-device').checked;

        try {
            const result = await this.auth.verify2FA(this.pendingUser, code, trustDevice);
            if (result.success) {
                document.getElementById('2fa-modal').classList.add('hidden');
                
                // Unlock dashboard
                document.getElementById('security-door').classList.add('hidden');
                document.getElementById('dashboard').classList.remove('hidden');
                
                // Update user info
                const userEl = document.getElementById('profile-name');
                if (userEl) userEl.innerText = result.username;
                
                toast.success(`Welcome, ${result.username}!`);
                this.pendingUser = null;
            } else {
                toast.error('Invalid 2FA code');
            }
        } catch (err) {
            toast.error(err.message);
        }
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.security = new Security();
});