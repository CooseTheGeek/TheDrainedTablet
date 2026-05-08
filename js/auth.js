// auth.js – DRAINED TABLET ULTIMATE v7.0.0
// Authentication: PIN-based, persistent sessions, Discord-linked accounts.

class AuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.sessionToken = null;
        this.sessionExpiry = null;
        this.lockoutUntil = null;
        this.attempts = 0;
    }

    loadUsers() {
        try {
            const saved = localStorage.getItem('tdl_users');
            let users = saved ? JSON.parse(saved) : {};
            // Ensure CooseTheGeek exists with master code 0827
            if (!users['CooseTheGeek']) {
                users['CooseTheGeek'] = {
                    discordId: null,
                    role: 'master',
                    pin: '0827',
                    createdAt: new Date().toISOString()
                };
            }
            return users;
        } catch (e) {
            return {};
        }
    }

    saveUsers() {
        localStorage.setItem('tdl_users', JSON.stringify(this.users));
    }

    getDeviceFingerprint() {
        const components = [
            navigator.userAgent,
            navigator.language,
            screen.colorDepth,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            navigator.hardwareConcurrency || 'unknown',
            navigator.deviceMemory || 'unknown'
        ];
        return this.hashString(components.join('|||'));
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return hash.toString(36);
    }

    generateSessionToken() {
        return 'token_' + Math.random().toString(36).substring(2, 15) +
               Math.random().toString(36).substring(2, 15);
    }

    checkSession() {
        const saved = localStorage.getItem('tdl_session');
        if (!saved) return null;
        try {
            const session = JSON.parse(saved);
            if (session.expires > Date.now()) {
                return session;
            }
        } catch (e) {}
        localStorage.removeItem('tdl_session');
        return null;
    }

    logout() {
        localStorage.removeItem('tdl_session');
        this.sessionToken = null;
        this.sessionExpiry = null;
    }

    async login(pin, discordId = null) {
        if (this.lockoutUntil && this.lockoutUntil > Date.now()) {
            const minutes = Math.ceil((this.lockoutUntil - Date.now()) / 60000);
            throw new Error(`Too many attempts. Locked for ${minutes} minutes.`);
        }

        let username = null;
        let user = null;
        
        // Check master
        if (pin === '0827') {
            username = 'CooseTheGeek';
            user = this.users[username];
            if (!user) {
                user = { discordId: null, role: 'master', pin: '0827', createdAt: new Date().toISOString() };
                this.users[username] = user;
                this.saveUsers();
            }
        } else {
            // Find user by discordId and pin
            for (let [u, data] of Object.entries(this.users)) {
                if (u !== 'CooseTheGeek' && data.discordId === discordId && data.pin === pin) {
                    username = u;
                    user = data;
                    break;
                }
            }
        }

        if (!user) {
            this.attempts++;
            if (this.attempts >= 5) {
                this.lockoutUntil = Date.now() + 15 * 60 * 1000;
                this.attempts = 0;
            }
            throw new Error('Invalid pin');
        }

        this.attempts = 0;
        const sessionToken = this.generateSessionToken();
        this.sessionToken = sessionToken;
        this.sessionExpiry = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('tdl_session', JSON.stringify({
            username,
            role: user.role,
            token: sessionToken,
            expires: this.sessionExpiry
        }));

        return { success: true, username, role: user.role, sessionToken };
    }

    register(discordId, discordUsername, discordAvatar, pin) {
        if (!discordId || !pin || pin.length !== 4) throw new Error('Invalid data');
        
        // Check if user with this discordId already exists
        for (let [username, data] of Object.entries(this.users)) {
            if (data.discordId === discordId) {
                throw new Error('Discord account already linked');
            }
        }
        
        const username = discordUsername;
        const user = {
            discordId: discordId,
            discordUsername: discordUsername,
            discordAvatar: discordAvatar,
            role: 'user',
            pin: pin,
            createdAt: new Date().toISOString()
        };
        this.users[username] = user;
        this.saveUsers();
        return user;
    }

    isPinSet(discordId) {
        for (let user of Object.values(this.users)) {
            if (user.discordId === discordId && user.pin) return true;
        }
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});