// security.js – with fallback master login

class Security {
    constructor() { this.init(); }
    init() {
        document.getElementById('login-btn')?.addEventListener('click', () => this.login());
        document.getElementById('first-time-setup')?.addEventListener('click', () => this.startDiscordAuth());
        document.getElementById('login-username')?.addEventListener('keypress', (e) => { if(e.key === 'Enter') this.login(); });
        document.getElementById('login-password')?.addEventListener('keypress', (e) => { if(e.key === 'Enter') this.login(); });
        this.checkExistingSession();
        this.setupModeToggle();
    }

    async login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        if (!username || !password) { document.getElementById('login-error').innerText = 'Enter username and password'; return; }
        if (username === 'CooseTheGeek' && password === '0827') {
            const sessionToken = 'master_fallback_' + Date.now();
            localStorage.setItem('tdl_session', JSON.stringify({ username:'CooseTheGeek', role:'master', token:sessionToken, expires:Date.now()+7*24*60*60*1000 }));
            localStorage.setItem('tdl_username','CooseTheGeek'); localStorage.setItem('tdl_role','master');
            AppState.user = { username:'CooseTheGeek', role:'master' };
            document.getElementById('security-door').style.display = 'none';
            document.getElementById('dashboard').classList.remove('hidden');
            this.updateModeToggleVisibility();
            toast.success('Welcome back, Master! (Fallback mode)');
            return;
        }
        try {
            const res = await fetch('https://drained-bridge.onrender.com/api/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if(!res.ok) throw new Error(await res.text());
            const data = await res.json();
            if(!data.success) throw new Error(data.error);
            localStorage.setItem('tdl_session', JSON.stringify({ username:data.username, role:data.role, token:data.sessionToken, expires:Date.now()+7*24*60*60*1000 }));
            localStorage.setItem('tdl_username',data.username); localStorage.setItem('tdl_role',data.role);
            const profileRes = await fetch('https://drained-bridge.onrender.com/api/user/profile', { headers: { 'Authorization': `Bearer ${data.sessionToken}` } });
            if(profileRes.ok){
                const profile = await profileRes.json();
                localStorage.setItem('tdl_platform',profile.platform||''); localStorage.setItem('tdl_platform_id',profile.platform_id||''); localStorage.setItem('tdl_avatar',profile.avatar_url||'');
                AppState.user = { username:profile.username, role:profile.role, platform:profile.platform, platformId:profile.platform_id, avatar:profile.avatar_url };
            } else { AppState.user = { username:data.username, role:data.role }; }
            document.getElementById('security-door').style.display = 'none';
            document.getElementById('dashboard').classList.remove('hidden');
            this.updateModeToggleVisibility();
            toast.success(`Welcome, ${data.username}!`);
        } catch(err){ document.getElementById('login-error').innerText = err.message; }
    }

    startDiscordAuth() { window.location.href = 'https://drained-bridge.onrender.com/api/discord/login'; }

    async checkExistingSession() {
        const sessionStr = localStorage.getItem('tdl_session');
        if(!sessionStr) return;
        try {
            const session = JSON.parse(sessionStr);
            if(session.expires > Date.now()){
                try {
                    const res = await fetch('https://drained-bridge.onrender.com/api/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ sessionToken:session.token }) });
                    if(res.ok){
                        const data = await res.json();
                        if(data.valid){
                            AppState.user = { username:data.username, role:data.role };
                            document.getElementById('security-door').style.display = 'none';
                            document.getElementById('dashboard').classList.remove('hidden');
                            this.updateModeToggleVisibility();
                            return;
                        }
                    }
                } catch(e){
                    console.warn('Bridge unreachable, accepting session');
                    AppState.user = { username:session.username, role:session.role };
                    document.getElementById('security-door').style.display = 'none';
                    document.getElementById('dashboard').classList.remove('hidden');
                    this.updateModeToggleVisibility();
                    return;
                }
                localStorage.removeItem('tdl_session');
            } else { localStorage.removeItem('tdl_session'); }
        } catch(e){ localStorage.removeItem('tdl_session'); }
    }

    setupModeToggle() {
        const toggleBtn = document.getElementById('mode-toggle');
        if(!toggleBtn) return;
        toggleBtn.addEventListener('click', () => {
            if(!window.accessControl.isMasterUser()){ toast.error('Only master can switch modes'); return; }
            const currentMode = window.accessControl.getUIMode();
            const newMode = currentMode === 'user' ? 'master' : 'user';
            window.accessControl.setUIMode(newMode);
            toggleBtn.innerText = newMode === 'master' ? '👑 Master' : '👤 User';
        });
    }

    updateModeToggleVisibility() {
        const toggleBtn = document.getElementById('mode-toggle');
        if(toggleBtn){
            const isMaster = window.accessControl.isMasterUser();
            toggleBtn.style.display = isMaster ? 'inline-flex' : 'none';
            if(isMaster) toggleBtn.innerText = window.accessControl.getUIMode() === 'master' ? '👑 Master' : '👤 User';
        }
    }
}
window.security = new Security();