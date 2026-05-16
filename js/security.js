// security.js – Hardcoded master login, mode toggle with password modal

class Security {
    constructor() {
        this.init();
    }

    init() {
        document.getElementById('login-btn')?.addEventListener('click', () => this.login());
        document.getElementById('first-time-setup')?.addEventListener('click', () => this.startDiscordAuth());
        document.getElementById('login-username')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        document.getElementById('login-password')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        this.checkExistingSession();
        this.setupModeToggle();
    }

    async login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        if (!username || !password) {
            document.getElementById('login-error').innerText = 'Enter username and password';
            return;
        }

        // Hardcoded master login
        if (username === 'CooseTheGeek' && password === '0827') {
            console.log('Master login');
            const sessionToken = 'master_' + Date.now();
            localStorage.setItem('tdl_session', JSON.stringify({
                username: 'CooseTheGeek',
                role: 'master',
                token: sessionToken,
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000
            }));
            localStorage.setItem('tdl_username', 'CooseTheGeek');
            localStorage.setItem('tdl_role', 'master');
            AppState.user = { username: 'CooseTheGeek', role: 'master' };
            document.getElementById('security-door').style.display = 'none';
            document.getElementById('dashboard').classList.remove('hidden');
            
            // Ensure mode is 'user' initially
            if (window.accessControl && window.accessControl.setUIMode) {
                window.accessControl.setUIMode('user');
            }
            this.updateModeToggleVisibility();
            if (window.masterControl) window.masterControl.loadDashboardUsers();
            toast.success('Welcome, Master!');
            return;
        }

        // Normal user login via bridge
        try {
            const res = await fetch('https://drained-bridge.onrender.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || 'Login failed');
            }
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            localStorage.setItem('tdl_session', JSON.stringify({
                username: data.username,
                role: data.role,
                token: data.sessionToken,
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000
            }));
            localStorage.setItem('tdl_username', data.username);
            localStorage.setItem('tdl_role', data.role);
            const profileRes = await fetch('https://drained-bridge.onrender.com/api/user/profile', {
                headers: { 'Authorization': `Bearer ${data.sessionToken}` }
            });
            if (profileRes.ok) {
                const profile = await profileRes.json();
                localStorage.setItem('tdl_platform', profile.platform || '');
                localStorage.setItem('tdl_platform_id', profile.platform_id || '');
                localStorage.setItem('tdl_avatar', profile.avatar_url || '');
                AppState.user = {
                    username: profile.username,
                    role: profile.role,
                    platform: profile.platform,
                    platformId: profile.platform_id,
                    avatar: profile.avatar_url
                };
            } else {
                AppState.user = { username: data.username, role: data.role };
            }
            document.getElementById('security-door').style.display = 'none';
            document.getElementById('dashboard').classList.remove('hidden');
            this.updateModeToggleVisibility();
            toast.success(`Welcome, ${data.username}!`);
        } catch (err) {
            console.error(err);
            document.getElementById('login-error').innerText = err.message;
        }
    }

    startDiscordAuth() {
        window.location.href = 'https://drained-bridge.onrender.com/api/discord/login';
    }

    async checkExistingSession() {
        const sessionStr = localStorage.getItem('tdl_session');
        if (!sessionStr) return;
        try {
            const session = JSON.parse(sessionStr);
            if (session.expires > Date.now()) {
                if (session.username === 'CooseTheGeek' && session.role === 'master') {
                    AppState.user = { username: 'CooseTheGeek', role: 'master' };
                    document.getElementById('security-door').style.display = 'none';
                    document.getElementById('dashboard').classList.remove('hidden');
                    this.updateModeToggleVisibility();
                    if (window.masterControl) window.masterControl.loadDashboardUsers();
                    return;
                }
                try {
                    const res = await fetch('https://drained-bridge.onrender.com/api/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionToken: session.token })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.valid) {
                            AppState.user = { username: data.username, role: data.role };
                            document.getElementById('security-door').style.display = 'none';
                            document.getElementById('dashboard').classList.remove('hidden');
                            this.updateModeToggleVisibility();
                            return;
                        }
                    }
                } catch (e) {
                    console.warn('Bridge unreachable, clearing session');
                }
                localStorage.removeItem('tdl_session');
            } else {
                localStorage.removeItem('tdl_session');
            }
        } catch (e) {
            localStorage.removeItem('tdl_session');
        }
    }

    setupModeToggle() {
        const toggleBtn = document.getElementById('mode-toggle');
        if (!toggleBtn) return;

        toggleBtn.addEventListener('click', () => {
            if (!window.accessControl.isMasterUser()) {
                toast.error('Only master can switch modes');
                return;
            }
            const currentMode = window.accessControl.getUIMode();
            if (currentMode === 'user') {
                // Switching to master – show password modal
                this.showMasterPasswordModal((success) => {
                    if (success) {
                        window.accessControl.setUIMode('master');
                        toggleBtn.innerText = '👑 Master';
                    }
                });
            } else {
                // Switching to user – no password needed
                window.accessControl.setUIMode('user');
                toggleBtn.innerText = '👤 User';
            }
        });
    }

    showMasterPasswordModal(callback) {
        // Create modal if not exists
        let modal = document.getElementById('master-password-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'master-password-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 350px; text-align: center;">
                    <h3 style="margin-bottom: 1rem;">🔒 Master Authentication</h3>
                    <p>Enter master password to access Master Mode</p>
                    <input type="password" id="master-password-input" placeholder="Password" style="width: 100%; padding: 0.6rem; margin: 1rem 0; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-primary);">
                    <div class="modal-actions" style="display: flex; gap: 0.5rem; justify-content: center;">
                        <button id="master-pwd-confirm" class="modal-btn primary">Unlock</button>
                        <button id="master-pwd-cancel" class="modal-btn">Cancel</button>
                    </div>
                    <p id="master-pwd-error" style="color: #ff5f5f; font-size: 0.8rem; margin-top: 0.5rem;"></p>
                </div>
            `;
            document.body.appendChild(modal);
        }
        modal.classList.remove('hidden');
        const input = document.getElementById('master-password-input');
        input.value = '';
        input.focus();

        const confirmBtn = document.getElementById('master-pwd-confirm');
        const cancelBtn = document.getElementById('master-pwd-cancel');
        const errorSpan = document.getElementById('master-pwd-error');

        const cleanup = () => {
            modal.classList.add('hidden');
            confirmBtn.removeEventListener('click', confirmHandler);
            cancelBtn.removeEventListener('click', cancelHandler);
            input.removeEventListener('keypress', keyHandler);
        };

        const confirmHandler = () => {
            const pwd = input.value;
            if (pwd === '0827') {
                cleanup();
                callback(true);
            } else {
                errorSpan.innerText = 'Incorrect password';
                input.value = '';
                input.focus();
            }
        };

        const cancelHandler = () => {
            cleanup();
            callback(false);
        };

        const keyHandler = (e) => {
            if (e.key === 'Enter') confirmHandler();
        };

        confirmBtn.addEventListener('click', confirmHandler);
        cancelBtn.addEventListener('click', cancelHandler);
        input.addEventListener('keypress', keyHandler);
    }

    updateModeToggleVisibility() {
        const toggleBtn = document.getElementById('mode-toggle');
        if (toggleBtn) {
            const isMaster = window.accessControl.isMasterUser();
            toggleBtn.style.display = isMaster ? 'inline-flex' : 'none';
            if (isMaster) {
                const mode = window.accessControl.getUIMode();
                toggleBtn.innerText = mode === 'master' ? '👑 Master' : '👤 User';
            }
        }
    }
}

window.security = new Security();