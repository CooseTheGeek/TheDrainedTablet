// profile.js – DRAINED TABLET ULTIMATE v7.0.0 (with null checks)

class Profile {
    constructor() {
        this.user = AppState.user || {};
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.populateUserData();
    }

    createHTML() {
        const tab = document.getElementById('tab-profile');
        if (!tab) return;
        tab.innerHTML = `
            <div class="profile-modern">
                <div class="profile-header">
                    <div class="profile-cover" id="cover-photo">
                        <img src="${this.user.coverPhoto || '/assets/default-cover.jpg'}" alt="Cover" onerror="this.src='https://via.placeholder.com/1200x200?text=Cover'">
                        <button class="edit-cover-btn" id="edit-cover">✎</button>
                    </div>
                    <div class="profile-avatar-container">
                        <div class="profile-avatar" id="profile-avatar">
                            <img src="${this.user.avatar || window.DEFAULT_AVATAR}" alt="Avatar" onerror="this.src=window.DEFAULT_AVATAR">
                            <button class="edit-avatar-btn" id="edit-avatar">✎</button>
                        </div>
                        <h2 id="display-name">${this.user.username || 'SURVIVOR'}</h2>
                        <p class="profile-role">${this.user.role || 'user'}</p>
                    </div>
                </div>
                <div class="profile-content">
                    <div class="profile-section">
                        <h3>Basic Information</h3>
                        <div class="info-grid">
                            <div class="info-item"><label>Display Name</label><input type="text" id="edit-name" value="${this.user.username || ''}"></div>
                            <div class="info-item"><label>Platform</label><select id="edit-platform"><option value="ps5">PlayStation 5</option><option value="ps4">PlayStation 4</option><option value="xbox">Xbox Series X|S</option><option value="xboxone">Xbox One</option></select></div>
                            <div class="info-item"><label>Platform ID</label><input type="text" id="edit-platform-id" value="${this.user.platformId || ''}" placeholder="PSN ID / Gamertag"></div>
                            <div class="info-item"><label>Discord</label><input type="text" id="edit-discord" value="${this.user.discordUsername || ''}" disabled><button id="link-discord" class="small-btn">Link Discord</button></div>
                        </div>
                    </div>
                    <div class="profile-section">
                        <h3>Appearance</h3>
                        <div class="info-grid">
                            <div class="info-item"><label>Theme</label><select id="edit-theme"><option value="dark">Dark</option><option value="light">Light</option><option value="rust">Rust</option></select></div>
                            <div class="info-item"><label>Animations</label><label class="switch"><input type="checkbox" id="edit-animations" checked><span class="slider"></span></label></div>
                        </div>
                    </div>
                    <div class="profile-section">
                        <h3>Server Preferences</h3>
                        <div class="info-grid">
                            <div class="info-item"><label>Default Server</label><select id="default-server"></select></div>
                            <div class="info-item"><label>Notification Settings</label><button class="small-btn" id="notif-settings">Configure</button></div>
                        </div>
                    </div>
                </div>
                <div class="profile-actions">
                    <button id="save-profile" class="profile-save-btn">Save Changes</button>
                </div>
            </div>
        `;
    }

    populateUserData() {
        const displayNameEl = document.getElementById('display-name');
        const profileRoleEl = document.getElementById('profile-role');
        const editNameEl = document.getElementById('edit-name');
        const editPlatformEl = document.getElementById('edit-platform');
        const editThemeEl = document.getElementById('edit-theme');
        const editAnimationsEl = document.getElementById('edit-animations');
        
        if (displayNameEl) displayNameEl.innerText = this.user.username || 'SURVIVOR';
        if (profileRoleEl) profileRoleEl.innerText = this.user.role || 'user';
        if (editNameEl) editNameEl.value = this.user.username || '';
        if (editPlatformEl) editPlatformEl.value = this.user.platform || 'ps5';
        if (editThemeEl) editThemeEl.value = localStorage.getItem('tdl_theme') || 'dark';
        if (editAnimationsEl) editAnimationsEl.checked = localStorage.getItem('tdl_animations') !== 'false';
        
        this.loadServers();
    }

    loadServers() {
        const serverSelect = document.getElementById('default-server');
        if (!serverSelect) return;
        const servers = JSON.parse(localStorage.getItem('tdl_master_servers') || '[]');
        serverSelect.innerHTML = '<option value="">Select a server</option>';
        servers.forEach(server => {
            serverSelect.innerHTML += `<option value="${server.id}">${server.name}</option>`;
        });
        const savedDefault = localStorage.getItem('tdl_default_server');
        if (savedDefault) serverSelect.value = savedDefault;
    }

    attachEvents() {
        const saveBtn = document.getElementById('save-profile');
        const editAvatarBtn = document.getElementById('edit-avatar');
        const editCoverBtn = document.getElementById('edit-cover');
        const linkDiscordBtn = document.getElementById('link-discord');
        const editAnimations = document.getElementById('edit-animations');
        const editTheme = document.getElementById('edit-theme');
        
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveChanges());
        if (editAvatarBtn) editAvatarBtn.addEventListener('click', () => this.uploadAvatar());
        if (editCoverBtn) editCoverBtn.addEventListener('click', () => this.uploadCover());
        if (linkDiscordBtn) linkDiscordBtn.addEventListener('click', () => this.linkDiscord());
        if (editAnimations) {
            editAnimations.addEventListener('change', (e) => {
                localStorage.setItem('tdl_animations', e.target.checked);
                if (e.target.checked) document.body.classList.remove('reduced-motion');
                else document.body.classList.add('reduced-motion');
            });
        }
        if (editTheme) {
            editTheme.addEventListener('change', (e) => {
                localStorage.setItem('tdl_theme', e.target.value);
                document.body.className = `theme-${e.target.value}`;
            });
        }
    }

    uploadAvatar() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const avatarImg = document.querySelector('.profile-avatar img');
                if (avatarImg) avatarImg.src = event.target.result;
                localStorage.setItem('tdl_avatar', event.target.result);
                if (AppState.user) AppState.user.avatar = event.target.result;
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    uploadCover() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const coverImg = document.querySelector('.profile-cover img');
                if (coverImg) coverImg.src = event.target.result;
                localStorage.setItem('tdl_coverPhoto', event.target.result);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    linkDiscord() {
        window.location.href = 'https://drained-bridge.onrender.com/api/discord/login';
    }

    saveChanges() {
        const newName = document.getElementById('edit-name')?.value || '';
        const newPlatform = document.getElementById('edit-platform')?.value || '';
        const newPlatformId = document.getElementById('edit-platform-id')?.value || '';
        const defaultServer = document.getElementById('default-server')?.value || '';
        
        if (newName) {
            if (AppState.user) AppState.user.username = newName;
            localStorage.setItem('tdl_username', newName);
            const displayName = document.getElementById('display-name');
            if (displayName) displayName.innerText = newName;
        }
        if (newPlatform && AppState.user) {
            AppState.user.platform = newPlatform;
            localStorage.setItem('tdl_platform', newPlatform);
        }
        if (newPlatformId && AppState.user) {
            AppState.user.platformId = newPlatformId;
            localStorage.setItem('tdl_platform_id', newPlatformId);
        }
        if (defaultServer) localStorage.setItem('tdl_default_server', defaultServer);
        
        toast.success('Profile updated successfully');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.profile = new Profile();
});