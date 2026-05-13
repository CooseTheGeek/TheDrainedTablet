// security.js – updated for username/password login with profile fetch

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
    }

    async login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        if (!username || !password) {
            document.getElementById('login-error').innerText = 'Enter username and password';
            return;
        }
        try {
            const res = await fetch('https://drained-bridge.onrender.com/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Store session
            localStorage.setItem('tdl_session', JSON.stringify({
                username: data.username,
                role: data.role,
                token: data.sessionToken,
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000
            }));

            // Fetch full profile (platform, platform_id, avatar)
            const profileRes = await fetch('https://drained-bridge.onrender.com/api/user/profile', {
                headers: { 'Authorization': `Bearer ${data.sessionToken}` }
            });
            const profile = await profileRes.json();
            if (profileRes.ok) {
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
            toast.success(`Welcome back, ${data.username}!`);
        } catch (err) {
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
                const res = await fetch('https://drained-bridge.onrender.com/api/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionToken: session.token })
                });
                const data = await res.json();
                if (data.valid) {
                    // Also fetch profile to ensure platform data is fresh
                    const profileRes = await fetch('https://drained-bridge.onrender.com/api/user/profile', {
                        headers: { 'Authorization': `Bearer ${session.token}` }
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
                } else {
                    localStorage.removeItem('tdl_session');
                }
            } else {
                localStorage.removeItem('tdl_session');
            }
        } catch (e) {
            localStorage.removeItem('tdl_session');
        }
    }
}

window.security = new Security();