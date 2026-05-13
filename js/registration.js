// registration.js – DRAINED TABLET v7.0.0 – Discord first-time setup

class Registration {
    constructor() {
        this.discordId = null;
        this.avatarUrl = null;
        this.init();
    }

    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const discordId = urlParams.get('discord_id');
        const avatar = urlParams.get('avatar');
        if (discordId) {
            this.discordId = discordId;
            this.avatarUrl = avatar || null;
            this.showRegistrationForm();
            window.history.replaceState({}, '', window.location.pathname);
        }
    }

    showRegistrationForm() {
        const door = document.getElementById('security-door');
        if (!door) return;
        door.innerHTML = `
            <div class="door-container glass-panel" style="max-width: 500px;">
                <div class="door-header">
                    <h1>🏴‍☠️ CREATE ACCOUNT</h1>
                    <p>Welcome! Set up your Drained Tablet access.</p>
                </div>
                <div class="form-group">
                    <label>Username (unique)</label>
                    <input type="text" id="reg-username" placeholder="e.g., RustySurvivor">
                </div>
                <div class="form-group">
                    <label>Password (min 6 characters)</label>
                    <input type="password" id="reg-password" placeholder="********">
                </div>
                <div class="form-group">
                    <label>Platform</label>
                    <select id="reg-platform">
                        <option value="ps5">PlayStation 5</option>
                        <option value="ps4">PlayStation 4</option>
                        <option value="xbox">Xbox Series X|S</option>
                        <option value="xboxone">Xbox One</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Platform ID (PSN ID / Xbox Gamertag)</label>
                    <input type="text" id="reg-platform-id" placeholder="Your gamertag or PSN ID">
                </div>
                <div class="form-group">
                    <label>Avatar (optional)</label>
                    <input type="file" id="reg-avatar" accept="image/*">
                    <div id="avatar-preview" style="margin-top: 5px;"></div>
                </div>
                <button id="complete-registration" class="door-btn primary">✅ COMPLETE SETUP</button>
                <div class="door-footer">
                    <p id="reg-error" class="error-msg"></p>
                </div>
            </div>
        `;
        document.getElementById('complete-registration').addEventListener('click', () => this.submitRegistration());
        document.getElementById('reg-avatar').addEventListener('change', (e) => this.previewAvatar(e));
    }

    previewAvatar(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const preview = document.getElementById('avatar-preview');
                if (preview) preview.innerHTML = `<img src="${ev.target.result}" style="max-width: 100px; border-radius: 50%;">`;
                this.avatarDataUrl = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    async submitRegistration() {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const platform = document.getElementById('reg-platform').value;
        const platformId = document.getElementById('reg-platform-id').value.trim();
        if (!username || !password || !platform || !platformId) {
            const errEl = document.getElementById('reg-error');
            if (errEl) errEl.innerText = 'All fields required';
            return;
        }
        if (password.length < 6) {
            const errEl = document.getElementById('reg-error');
            if (errEl) errEl.innerText = 'Password must be at least 6 characters';
            return;
        }

        const avatarUrl = this.avatarDataUrl || this.avatarUrl;
        try {
            const res = await fetch('https://drained-bridge.onrender.com/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discordId: this.discordId,
                    username,
                    password,
                    platform,
                    platformId,
                    avatarUrl
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            localStorage.setItem('tdl_session', JSON.stringify({
                username: data.username,
                role: data.role,
                token: data.sessionToken,
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000
            }));
            localStorage.setItem('tdl_platform', platform);
            localStorage.setItem('tdl_platform_id', platformId);
            AppState.user = { username: data.username, role: data.role, platform, platformId };
            document.getElementById('security-door').style.display = 'none';
            document.getElementById('dashboard').classList.remove('hidden');
            toast.success('Account created! Welcome to the Drained Tablet.');
        } catch (err) {
            const errEl = document.getElementById('reg-error');
            if (errEl) errEl.innerText = err.message;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.registration = new Registration();
});