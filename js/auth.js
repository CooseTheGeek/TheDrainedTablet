// auth.js – DRAINED TABLET ULTIMATE v7.0.0
// Three‑tier authentication with real TOTP (Google Authenticator compatible).
// Master code updated to 0827 for CooseTheGeek.

class AuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.totpSecrets = this.loadTotpSecrets();
        this.trustedDevices = this.loadTrustedDevices();
        this.sessionToken = null;
        this.sessionExpiry = null;
        this.lockoutUntil = null;
        this.attempts = 0;
    }

    loadUsers() {
        try {
            const saved = localStorage.getItem('tdl_users');
            return saved ? JSON.parse(saved) : {
                'CooseTheGeek': {
                    code: '0827',
                    role: 'master',
                    totpEnabled: false,
                    created: new Date().toISOString()
                }
            };
        } catch (e) {
            return {};
        }
    }

    saveUsers() {
        localStorage.setItem('tdl_users', JSON.stringify(this.users));
    }

    loadTotpSecrets() {
        const saved = localStorage.getItem('tdl_totp_secrets');
        return saved ? JSON.parse(saved) : {};
    }

    saveTotpSecrets() {
        localStorage.setItem('tdl_totp_secrets', JSON.stringify(this.totpSecrets));
    }

    loadTrustedDevices() {
        const saved = localStorage.getItem('tdl_trusted_devices');
        return saved ? JSON.parse(saved) : {};
    }

    saveTrustedDevices() {
        localStorage.setItem('tdl_trusted_devices', JSON.stringify(this.trustedDevices));
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

    isDeviceTrusted(username) {
        const fingerprint = this.getDeviceFingerprint();
        const trusted = this.trustedDevices[username]?.[fingerprint];
        return trusted && trusted.expires > Date.now();
    }

    trustDevice(username, days = 30) {
        const fingerprint = this.getDeviceFingerprint();
        if (!this.trustedDevices[username]) {
            this.trustedDevices[username] = {};
        }
        this.trustedDevices[username][fingerprint] = {
            expires: Date.now() + days * 24 * 60 * 60 * 1000
        };
        this.saveTrustedDevices();
    }

    generateTotpSecret(username) {
        let randomBytes;
        if (window.crypto && window.crypto.getRandomValues) {
            randomBytes = new Uint8Array(16);
            window.crypto.getRandomValues(randomBytes);
        } else {
            randomBytes = new Uint8Array(16);
            for (let i = 0; i < 16; i++) randomBytes[i] = Math.floor(Math.random() * 256);
        }
        const secret = this.base32Encode(randomBytes);
        const issuer = encodeURIComponent('Drained Tablet');
        const account = encodeURIComponent(username);
        const uri = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`;
        this.totpSecrets[username] = secret;
        this.saveTotpSecrets();
        return { secret, uri };
    }

    base32Encode(buffer) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let result = '';
        let bits = 0;
        let value = 0;
        for (let i = 0; i < buffer.length; i++) {
            value = (value << 8) | buffer[i];
            bits += 8;
            while (bits >= 5) {
                result += alphabet[(value >>> (bits - 5)) & 31];
                bits -= 5;
            }
        }
        if (bits > 0) {
            result += alphabet[(value << (5 - bits)) & 31];
        }
        return result;
    }

    verifyTotp(username, code) {
        const secret = this.totpSecrets[username];
        if (!secret) return false;
        if (typeof OTPAuth === 'undefined') {
            console.error('OTPAuth library not loaded');
            return false;
        }
        try {
            const totp = new OTPAuth.TOTP({
                secret: OTPAuth.Secret.fromBase32(secret),
                digits: 6,
                period: 30
            });
            const now = Math.floor(Date.now() / 1000);
            for (let delta = -1; delta <= 1; delta++) {
                const token = totp.generate({ timestamp: (now + delta * 30) * 1000 });
                if (token === code) return true;
            }
        } catch (e) {
            console.error('TOTP verification error:', e);
        }
        return false;
    }

    enable2FA(username) {
        if (!this.users[username]) return;
        this.users[username].totpEnabled = true;
        this.saveUsers();
    }

    disable2FA(username, masterUser) {
        if (masterUser !== 'CooseTheGeek') return;
        if (this.users[username]) {
            this.users[username].totpEnabled = false;
            this.saveUsers();
        }
    }

    async login(code, rconCredentials = null) {
        if (this.lockoutUntil && this.lockoutUntil > Date.now()) {
            const minutes = Math.ceil((this.lockoutUntil - Date.now()) / 60000);
            throw new Error(`Too many attempts. Locked for ${minutes} minutes.`);
        }

        let username = null;
        let user = null;
        for (let [u, data] of Object.entries(this.users)) {
            if (data.code === code) {
                username = u;
                user = data;
                break;
            }
        }
        if (!user) {
            this.attempts++;
            if (this.attempts >= 5) {
                this.lockoutUntil = Date.now() + 15 * 60 * 1000;
                this.attempts = 0;
            }
            throw new Error('Invalid code');
        }

        let role = user.role;
        if (rconCredentials) {
            const valid = await this.testRconConnection(rconCredentials);
            if (!valid) throw new Error('Invalid RCON credentials');
            role = 'owner';
        }

        const require2FA = (role === 'owner') || (role === 'master' && user.totpEnabled);
        if (require2FA && !this.isDeviceTrusted(username)) {
            return {
                success: false,
                require2FA: true,
                username,
                role
            };
        }

        this.attempts = 0;
        const sessionToken = this.generateSessionToken();
        this.sessionToken = sessionToken;
        this.sessionExpiry = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('tdl_session', JSON.stringify({
            username,
            role,
            token: sessionToken,
            expires: this.sessionExpiry
        }));

        return {
            success: true,
            username,
            role,
            sessionToken
        };
    }

    async verify2FA(username, code, trustDevice = false) {
        if (!this.verifyTotp(username, code)) {
            throw new Error('Invalid 2FA code');
        }
        if (trustDevice) {
            this.trustDevice(username);
        }
        const user = this.users[username];
        const sessionToken = this.generateSessionToken();
        this.sessionToken = sessionToken;
        this.sessionExpiry = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('tdl_session', JSON.stringify({
            username,
            role: user.role,
            token: sessionToken,
            expires: this.sessionExpiry
        }));
        return {
            success: true,
            username,
            role: user.role,
            sessionToken
        };
    }

    async testRconConnection(credentials) {
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await res.json();
            return data.success;
        } catch (e) {
            return false;
        }
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

    addUser(username, code, role, masterUser) {
        if (masterUser !== 'CooseTheGeek') throw new Error('Only master can add users');
        if (this.users[username]) throw new Error('User already exists');
        if (!code || code.length !== 4 || !/^\d+$/.test(code)) throw new Error('Code must be 4 digits');
        this.users[username] = {
            code,
            role,
            totpEnabled: false,
            created: new Date().toISOString()
        };
        this.saveUsers();
    }

    removeUser(username, masterUser) {
        if (masterUser !== 'CooseTheGeek') throw new Error('Only master can remove users');
        if (username === 'CooseTheGeek') throw new Error('Cannot remove primary master');
        delete this.users[username];
        this.saveUsers();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});