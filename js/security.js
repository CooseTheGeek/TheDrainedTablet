// security.js – DRAINED TABLET ULTIMATE v7.0.0
// Security door, 2FA, Discord linking, and forgot code.

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
        this.createDiscordModal();
        this.setupDiscordModalDelegation();
        this.updateRoleBadge();
        this.checkSessionAndShowDashboard();
    }

    checkSessionAndShowDashboard() {
        const session = localStorage.getItem('tdl_session');
        if (session) {
            try {
                const sess = JSON.parse(session);
                if (sess.expires > Date.now()) {
                    document.getElementById('security-door').classList.add('hidden');
                    document.getElementById('dashboard').classList.remove('hidden');
                    if (window.AppState) {
                        AppState.user.username = sess.username;
                        AppState.user.role = sess.role;
                    }
                    console.log('✅ Valid session found, dashboard shown');
                    return;
                }
            } catch(e) {}
        }
        console.log('No valid session, security door remains');
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
                
                AppState.user.role = result.role;
                AppState.user.username = result.username;
                this.updateRoleBadge();
                
                document.getElementById('security-door').classList.add('hidden');
                document.getElementById('dashboard').classList.remove('hidden');
                
                const userEl = document.getElementById('profile-name');
                if (userEl) userEl.innerText = result.username;
                
                toast.success(`Welcome, ${result.username}!`);

                if (!localStorage.getItem('discord_linked')) {
                    setTimeout(() => this.showDiscordModal(), 500);
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
        this.showDiscordModal();
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
                
                AppState.user.role = result.role;
                AppState.user.username = result.username;
                this.updateRoleBadge();
                
                document.getElementById('security-door').classList.add('hidden');
                document.getElementById('dashboard').classList.remove('hidden');
                
                const userEl = document.getElementById('profile-name');
                if (userEl) userEl.innerText = result.username;
                
                toast.success(`Welcome, ${result.username}!`);
                this.pendingUser = null;

                if (!localStorage.getItem('discord_linked')) {
                    setTimeout(() => this.showDiscordModal(), 500);
                }
            } else {
                toast.error('Invalid 2FA code');
            }
        } catch (err) {
            toast.error(err.message);
        }
    }

    // ---------- Discord/Forgot Modal ----------
    createDiscordModal() {
        if (document.getElementById('discord-modal')) return;
        
        const modalHTML = `
            <div id="discord-modal" class="modal hidden">
                <div class="modal-content">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="margin:0;">🔗 Link Discord Account</h3>
                        <button id="discord-close-btn" style="background:none; border:none; font-size:1.5rem; cursor:pointer; color: var(--text-primary);">&times;</button>
                    </div>
                    <p>Connect your Discord to enable notifications and direct messaging.</p>
                    <button id="discord-link-btn" class="modal-btn primary">Link Discord</button>
                    <button id="discord-skip-btn" class="modal-btn">Skip</button>
                    <hr>
                    <h4>Forgot your code?</h4>
                    <p>An email will be sent to the master. You can also DM CooseTheGeek directly.</p>
                    <button id="forgot-email-btn" class="modal-btn">Send Email</button>
                    <button id="forgot-discord-dm-btn" class="modal-btn">DM Master on Discord</button>
                    <div class="modal-actions" style="margin-top: 1rem;">
                        <button id="discord-cancel-btn" class="modal-btn">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    setupDiscordModalDelegation() {
        const modal = document.getElementById('discord-modal');
        if (!modal) return;

        modal.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            const id = target.id;
            
            if (id === 'discord-close-btn' || id === 'discord-cancel-btn') {
                modal.classList.add('hidden');
            }
            else if (id === 'discord-skip-btn') {
                localStorage.setItem('discord_linked', 'skipped');
                modal.classList.add('hidden');
                toast.info('Discord linking skipped');
            }
            else if (id === 'discord-link-btn') {
                window.location.href = 'https://drained-bridge.onrender.com/api/discord/login';
            }
            else if (id === 'forgot-email-btn') {
                this.sendForgotEmail();
            }
            else if (id === 'forgot-discord-dm-btn') {
                this.dmMaster();
            }
        });
    }

    showDiscordModal() {
        const modal = document.getElementById('discord-modal');
        if (modal) {
            if (localStorage.getItem('discord_linked') === 'skipped') {
                return;
            }
            modal.classList.remove('hidden');
        }
    }

    linkDiscord() {
        window.location.href = 'https://drained-bridge.onrender.com/api/discord/login';
    }

    sendForgotEmail() {
        fetch('https://drained-bridge.onrender.com/api/forgot-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: AppState.user?.username || 'unknown' })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                toast.info('Email sent to master.');
            } else {
                toast.error('Failed to send email.');
            }
        })
        .catch(() => toast.error('Network error.'));
        document.getElementById('discord-modal').classList.add('hidden');
    }

    dmMaster() {
        const masterDiscordId = '546976779534073882';
        window.open(`https://discord.com/users/${masterDiscordId}`, '_blank');
        document.getElementById('discord-modal').classList.add('hidden');
    }

    checkDiscordReturn() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('discord') === 'linked') {
            const discordId = urlParams.get('id');
            if (discordId) {
                localStorage.setItem('discord_linked', 'true');
                localStorage.setItem('discord_id', discordId);
                toast.success('Discord linked successfully!');
                window.history.replaceState({}, '', window.location.pathname);
                // Ensure dashboard is visible if already logged in
                if (localStorage.getItem('tdl_session')) {
                    document.getElementById('security-door').classList.add('hidden');
                    document.getElementById('dashboard').classList.remove('hidden');
                }
            } else {
                toast.error('Discord linking failed: no ID received');
            }
        } else if (urlParams.get('discord') === 'error') {
            const errorMsg = urlParams.get('message');
            toast.error(`Discord link failed: ${errorMsg || 'Unknown error'}`);
            window.history.replaceState({}, '', window.location.pathname);
        }

        // After handling any URL parameters, always show the dashboard if there's a valid session
        this.checkSessionAndShowDashboard();
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
    window.security.checkDiscordReturn();
});