// auth.js – DRAINED TABLET ULTIMATE v7.0.0
// Simplified two‑role authentication with hardcoded master (CooseTheGeek).
// Server owners have their own codes and data isolation.

class AuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.totpSecrets = this.loadTotpSecrets();
        this.trustedDevices = this.loadTrustedDevices();
        this.sessionToken = null;
        this.sessionExpiry = null;
        this.lockoutUntil = null;
        this.attempts = 0;
        this.masterUsername = 'CooseTheGeek'; // Hardcoded master
        this.masterCode = '0325'; // Master code – keep secure
    }

    loadUsers() {
        try {
            const saved = localStorage.getItem('tdl_users');
            return saved ? JSON.parse(saved) : {};
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

    // Device fingerprint
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

    // Generate TOTP secret
    generateTotpSecret(username) {
        const randomBytes = new Uint8Array(16);
        window.crypto.getRandomValues(randomBytes);
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

    disable2FA(username) {
        // Only master can disable for others, but we'll allow self? For simplicity, master only.
        if (username === this.masterUsername) return; // can't disable master's 2FA via this method
        if (this.users[username]) {
            this.users[username].totpEnabled = false;
            this.saveUsers();
        }
    }

    // Login attempt
    async login(code) {
        // Rate limiting
        if (this.lockoutUntil && this.lockoutUntil > Date.now()) {
            const minutes = Math.ceil((this.lockoutUntil - Date.now()) / 60000);
            throw new Error(`Too many attempts. Locked for ${minutes} minutes.`);
        }

        // Check master first
        if (code === this.masterCode) {
            // Master login – no 2FA required? We'll allow optional 2FA if set.
            const require2FA = this.users[this.masterUsername]?.totpEnabled === true;
            if (require2FA && !this.isDeviceTrusted(this.masterUsername)) {
                return {
                    success: false,
                    require2FA: true,
                    username: this.masterUsername,
                    role: 'master'
                };
            }
            this.attempts = 0;
            const sessionToken = this.generateSessionToken();
            this.sessionToken = sessionToken;
            this.sessionExpiry = Date.now() + 24 * 60 * 60 * 1000;
            localStorage.setItem('tdl_session', JSON.stringify({
                username: this.masterUsername,
                role: 'master',
                token: sessionToken,
                expires: this.sessionExpiry
            }));
            return {
                success: true,
                username: this.masterUsername,
                role: 'master',
                sessionToken
            };
        }

        // Otherwise check server owners
        let username = null;
        let user = null;
        for (let [u, data] of Object.entries(this.users)) {
            if (data.code === code && u !== this.masterUsername) {
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

        const role = 'owner'; // All non‑master are server owners

        const require2FA = user.totpEnabled === true && !this.isDeviceTrusted(username);
        if (require2FA) {
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

    // Verify 2FA after initial login
    async verify2FA(username, code, trustDevice = false) {
        if (!this.verifyTotp(username, code)) {
            throw new Error('Invalid 2FA code');
        }
        if (trustDevice) {
            this.trustDevice(username);
        }
        const role = username === this.masterUsername ? 'master' : 'owner';
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

    // Add a server owner (master only)
    addUser(username, code, masterUser) {
        if (masterUser !== this.masterUsername) throw new Error('Only master can add users');
        if (this.users[username]) throw new Error('User already exists');
        if (!code || code.length !== 4 || !/^\d+$/.test(code)) throw new Error('Code must be 4 digits');
        this.users[username] = {
            code,
            role: 'owner',
            totpEnabled: false,
            created: new Date().toISOString()
        };
        this.saveUsers();
    }

    // Remove a server owner (master only)
    removeUser(username, masterUser) {
        if (masterUser !== this.masterUsername) throw new Error('Only master can remove users');
        if (username === this.masterUsername) throw new Error('Cannot remove primary master');
        delete this.users[username];
        this.saveUsers();
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});