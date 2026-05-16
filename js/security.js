// security.js – Simple login with hardcoded master (CooseTheGeek / 0827)

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

        // Hardcoded master login – always works, no API call
        if (username === 'CooseTheGeek' && password === '0827') {
            console.log('Master login using hardcoded credentials');
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
            this.updateModeToggleVisibility();
            // Load user list if master
            if (window.masterControl) window.masterControl.loadDashboardUsers();
            toast.success('Welcome, Master!');
            return;
        }

        // Normal user login via bridge API
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
            // Fetch profile for platform info
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
                // For master, just accept
                if (session.username === 'CooseTheGeek' && session.role === 'master') {
                    AppState.user = { username: 'CooseTheGeek', role: 'master' };
                    document.getElementById('security-door').style.display = 'none';
                    document.getElementById('dashboard').classList.remove('hidden');
                    this.updateModeToggleVisibility();
                    if (window.masterControl) window.masterControl.loadDashboardUsers();
                    return;
                }
                // Verify user session with bridge
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
                    // Bridge unreachable, but session exists – assume valid for users? Better to logout.
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
        toggleBtn.addEventListener('click', async () => {
            if (!window.accessControl.isMasterUser()) {
                toast.error('Only master can switch modes');
                return;
            }
            const currentMode = window.accessControl.getUIMode();
            const newMode = currentMode === 'user' ? 'master' : 'user';
            // Switching to master requires password
            if (newMode === 'master') {
                const pwd = prompt('Enter master password to switch to Master Mode:');
                if (pwd !== '0827') {
                    toast.error('Incorrect password');
                    return;
                }
            }
            await window.accessControl.setUIMode(newMode);
            const roleBadge = document.getElementById('role-badge');
            if (roleBadge) roleBadge.innerText = newMode === 'master' ? 'MASTER' : (AppState.user?.role || 'USER').toUpperCase();
            toggleBtn.innerText = newMode === 'master' ? '👑 Master' : '👤 User';
        });
    }

    updateModeToggleVisibility() {
        const toggleBtn = document.getElementById('mode-toggle');
        if (toggleBtn) {
            const isMaster = window.accessControl.isMasterUser();
            toggleBtn.style.display = isMaster ? 'inline-flex' : 'none';
            if (isMaster) {
                toggleBtn.innerText = window.accessControl.getUIMode() === 'master' ? '👑 Master' : '👤 User';
            }
        }
    }
}

window.security = new Security();