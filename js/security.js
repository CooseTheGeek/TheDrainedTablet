// security.js – DRAINED TABLET ULTIMATE v7.0.0
// Security door and access control, with 2FA support and first‑time role selection.

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
        this.createRoleModal(); // Add role selection modal
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
                
                // Update global user state
                AppState.user.role = result.role;
                AppState.user.username = result.username;
                
                // Unlock dashboard
                document.getElementById('security-door').classList.add('hidden');
                document.getElementById('dashboard').classList.remove('hidden');
                
                // Update user info in header
                const userEl = document.getElementById('profile-name');
                if (userEl) userEl.innerText = result.username;
                
                toast.success(`Welcome, ${result.username}!`);

                // If the user has no role (shouldn't happen, but just in case), show role modal
                if (!result.role || result.role === 'none') {
                    this.showRoleModal(result.username);
                }
            } else if (result.require2FA) {
                this.pendingUser = result.username;
                this.pendingRole = result.role;
                this.show2FAModal();
                this.clearCode();
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

    // ---------- 2FA Modal ----------
    create2FAModal() {
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
                
                // Update global user state
                AppState.user.role = result.role;
                AppState.user.username = result.username;
                
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

    // ---------- Role Selection Modal ----------
    createRoleModal() {
        if (document.getElementById('role-modal')) return;
        
        const modalHTML = `
            <div id="role-modal" class="modal hidden">
                <div class="modal-content">
                    <h3>👤 Select Your Role</h3>
                    <p>Choose your initial role. You can change this later in User Management.</p>
                    <div class="role-option" data-role="user">
                        <input type="radio" name="role" value="user" id="role-user">
                        <label for="role-user">👤 User</label>
                        <span>Basic access – view only, no commands</span>
                    </div>
                    <div class="role-option" data-role="master">
                        <input type="radio" name="role" value="master" id="role-master">
                        <label for="role-master">👑 Master</label>
                        <span>Dashboard admin – can manage users, no server commands</span>
                    </div>
                    <div class="role-option" data-role="owner">
                        <input type="radio" name="role" value="owner" id="role-owner">
                        <label for="role-owner">🔒 Owner</label>
                        <span>Full control – server commands, master access</span>
                    </div>
                    <div class="modal-actions">
                        <button id="set-role" class="modal-btn primary">Set Role</button>
                        <button id="skip-role" class="modal-btn">Skip (stay as user)</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('set-role')?.addEventListener('click', () => this.setRole());
        document.getElementById('skip-role')?.addEventListener('click', () => {
            document.getElementById('role-modal').classList.add('hidden');
            toast.info('Role selection skipped – you are a basic user.');
        });

        // Make role options clickable
        document.querySelectorAll('.role-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                opt.querySelector('input').checked = true;
            });
        });
    }

    showRoleModal(username) {
        this.pendingUser = username;
        document.getElementById('role-modal').classList.remove('hidden');
    }

    setRole() {
        const selected = document.querySelector('input[name="role"]:checked');
        if (!selected) {
            toast.error('Please select a role');
            return;
        }
        const role = selected.value;
        // Update user role in AppState and localStorage
        AppState.user.role = role;
        localStorage.setItem('tdl_role', role);
        // Also update in users object
        let users = JSON.parse(localStorage.getItem('tdl_users') || '{}');
        if (users[this.pendingUser]) {
            users[this.pendingUser].role = role;
            localStorage.setItem('tdl_users', JSON.stringify(users));
        }
        document.getElementById('role-modal').classList.add('hidden');
        toast.success(`Role set to ${role}`);
        if (window.accessControl) window.accessControl.applyUIPermissions();
        this.pendingUser = null;
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.security = new Security();
});