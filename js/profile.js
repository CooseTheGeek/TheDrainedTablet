// profile.js – DRAINED TABLET ULTIMATE v7.0.0
// User profile management, platform selection, ID card generation, and saved servers.

class Profile {
    constructor() {
        this.tablet = window.drainedTablet;
        this.auth = window.authSystem;
        this.db = window.database;
        this.savedServers = this.loadServers();
        this.platforms = ['ps5', 'ps4', 'xbox', 'xboxone'];
        this.init();
    }

    loadServers() {
        const saved = localStorage.getItem('tdl_saved_servers');
        return saved ? JSON.parse(saved) : [];
    }

    saveServers() {
        localStorage.setItem('tdl_saved_servers', JSON.stringify(this.savedServers));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.populateUserInfo();
        this.renderServers();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'profile') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-profile');
        if (!tab) return;
        tab.innerHTML = `
            <div class="profile-container">
                <div class="profile-header">
                    <h2>👤 USER PROFILE</h2>
                </div>

                <div class="profile-grid">
                    <!-- Left Column: Avatar & Basic Info -->
                    <div class="profile-left">
                        <div class="avatar-section">
                            <div class="avatar-preview" id="avatar-preview">
                                ${this.getAvatarHTML()}
                            </div>
                            <div class="avatar-controls">
                                <button id="upload-avatar" class="profile-btn">📤 UPLOAD</button>
                                <button id="remove-avatar" class="profile-btn">🗑️ REMOVE</button>
                            </div>
                        </div>

                        <div class="basic-info">
                            <div class="info-row">
                                <span>Username:</span>
                                <span id="profile-username">${AppState.user.username || 'Not logged in'}</span>
                            </div>
                            <div class="info-row">
                                <span>Role:</span>
                                <span id="profile-role">${AppState.user.role || 'user'}</span>
                            </div>
                            <div class="info-row">
                                <span>Platform:</span>
                                <select id="profile-platform">
                                    <option value="">Select Platform</option>
                                    <option value="ps5" ${AppState.user.platform === 'ps5' ? 'selected' : ''}>PlayStation 5</option>
                                    <option value="ps4" ${AppState.user.platform === 'ps4' ? 'selected' : ''}>PlayStation 4</option>
                                    <option value="xbox" ${AppState.user.platform === 'xbox' ? 'selected' : ''}>Xbox Series X|S</option>
                                    <option value="xboxone" ${AppState.user.platform === 'xboxone' ? 'selected' : ''}>Xbox One</option>
                                </select>
                            </div>
                            <div class="info-row">
                                <span>Platform ID:</span>
                                <input type="text" id="profile-platform-id" placeholder="PSN ID or Xbox Gamertag" value="${AppState.user.platformId || ''}">
                            </div>
                            <button id="save-profile" class="profile-btn primary">💾 SAVE PROFILE</button>
                        </div>
                    </div>

                    <!-- Right Column: ID Card -->
                    <div class="profile-right">
                        <h3>MY ID CARD</h3>
                        <div class="id-card" id="id-card">
                            <div class="id-card-inner">
                                <div class="id-card-header">
                                    <span class="id-card-title">THE DRAINED LAND'S</span>
                                    <span class="id-card-badge">OFFICIAL</span>
                                </div>
                                <div class="id-card-avatar" id="id-card-avatar">${this.getAvatarHTML()}</div>
                                <div class="id-card-name" id="id-card-name">${AppState.user.username || 'SURVIVOR'}</div>
                                <div class="id-card-role" id="id-card-role">${AppState.user.role ? AppState.user.role.toUpperCase() : 'PLAYER'}</div>
                                <div class="id-card-platform" id="id-card-platform">${AppState.user.platform ? this.getPlatformDisplay(AppState.user.platform) : ''}</div>
                                <div class="id-card-id" id="id-card-id">${AppState.user.platformId || ''}</div>
                                <div class="id-card-footer">
                                    <span>⚡ 3UNKS ⚡</span>
                                </div>
                            </div>
                        </div>
                        <div class="id-card-controls">
                            <button id="download-id" class="profile-btn">⬇️ DOWNLOAD</button>
                            <button id="customize-id" class="profile-btn">🎨 CUSTOMIZE</button>
                        </div>
                    </div>

                    <!-- Saved Servers Section -->
                    <div class="profile-servers">
                        <h3>📋 SAVED SERVERS</h3>
                        <div id="servers-list" class="servers-list"></div>
                        <button id="add-server" class="profile-btn">➕ ADD SERVER</button>
                    </div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        document.getElementById('upload-avatar')?.addEventListener('click', () => this.uploadAvatar());
        document.getElementById('remove-avatar')?.addEventListener('click', () => this.removeAvatar());
        document.getElementById('save-profile')?.addEventListener('click', () => this.saveProfile());
        document.getElementById('download-id')?.addEventListener('click', () => this.downloadID());
        document.getElementById('customize-id')?.addEventListener('click', () => this.customizeID());
        document.getElementById('add-server')?.addEventListener('click', () => this.addServer());

        // Live preview when platform/ID changes
        document.getElementById('profile-platform')?.addEventListener('change', () => this.updateIDPreview());
        document.getElementById('profile-platform-id')?.addEventListener('input', () => this.updateIDPreview());
    }

    getAvatarHTML() {
        const avatar = AppState.user.avatar;
        if (avatar) {
            return `<img src="${avatar}" alt="avatar" class="avatar-img">`;
        }
        return `<div class="avatar-placeholder">${AppState.user.username ? AppState.user.username.charAt(0).toUpperCase() : '?'}</div>`;
    }

    getPlatformDisplay(platform) {
        const map = {
            ps5: 'PlayStation 5',
            ps4: 'PlayStation 4',
            xbox: 'Xbox Series X|S',
            xboxone: 'Xbox One'
        };
        return map[platform] || platform;
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
                AppState.user.avatar = event.target.result;
                localStorage.setItem('tdl_avatar', event.target.result);
                this.updateIDPreview();
                document.getElementById('avatar-preview').innerHTML = this.getAvatarHTML();
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    removeAvatar() {
        AppState.user.avatar = null;
        localStorage.removeItem('tdl_avatar');
        this.updateIDPreview();
        document.getElementById('avatar-preview').innerHTML = this.getAvatarHTML();
    }

    saveProfile() {
        const platform = document.getElementById('profile-platform').value;
        const platformId = document.getElementById('profile-platform-id').value.trim();
        if (platform && !platformId) {
            this.tablet.showError('Platform ID is required when platform is selected');
            return;
        }
        AppState.user.platform = platform || null;
        AppState.user.platformId = platformId || null;
        if (platform) localStorage.setItem('tdl_platform', platform);
        if (platformId) localStorage.setItem('tdl_platform_id', platformId);
        this.updateIDPreview();
        this.tablet.showToast('Profile saved', 'success');
    }

    updateIDPreview() {
        const platform = document.getElementById('profile-platform').value;
        const platformId = document.getElementById('profile-platform-id').value.trim();
        const username = AppState.user.username || 'SURVIVOR';
        const role = AppState.user.role || 'user';
        const avatarHTML = this.getAvatarHTML();

        document.getElementById('id-card-avatar').innerHTML = avatarHTML;
        document.getElementById('id-card-name').innerText = username;
        document.getElementById('id-card-role').innerText = role.toUpperCase();
        document.getElementById('id-card-platform').innerText = platform ? this.getPlatformDisplay(platform) : '';
        document.getElementById('id-card-id').innerText = platformId || '';
    }

    downloadID() {
        const card = document.getElementById('id-card');
        // Simple screenshot using html2canvas? For now, just a placeholder.
        this.tablet.showToast('ID card download feature coming soon', 'info');
    }

    customizeID() {
        this.tablet.showToast('ID card customization coming soon', 'info');
    }

    renderServers() {
        const listDiv = document.getElementById('servers-list');
        if (!listDiv) return;
        if (this.savedServers.length === 0) {
            listDiv.innerHTML = '<div class="no-servers">No saved servers</div>';
            return;
        }
        let html = '';
        this.savedServers.forEach(server => {
            html += `
                <div class="server-card">
                    <div class="server-info">
                        <span class="server-name">${server.name}</span>
                        <span class="server-address">${server.ip}:${server.port}</span>
                    </div>
                    <div class="server-actions">
                        <button class="small-btn load-server" data-id="${server.id}">📂 LOAD</button>
                        <button class="small-btn delete-server" data-id="${server.id}">🗑️</button>
                    </div>
                </div>
            `;
        });
        listDiv.innerHTML = html;

        listDiv.querySelectorAll('.load-server').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.loadServer(id);
            });
        });
        listDiv.querySelectorAll('.delete-server').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.deleteServer(id);
            });
        });
    }

    addServer() {
        const name = prompt('Enter server name:');
        if (!name) return;
        const ip = prompt('Enter server IP:');
        if (!ip) return;
        const port = prompt('Enter RCON port (default 28916):', '28916');
        if (!port) return;
        const password = prompt('Enter RCON password:');
        if (!password) return;
        const server = {
            id: 'server_' + Date.now(),
            name,
            ip,
            port: parseInt(port),
            password
        };
        this.savedServers.push(server);
        this.saveServers();
        this.renderServers();
        this.tablet.showToast('Server saved', 'success');
    }

    loadServer(id) {
        const server = this.savedServers.find(s => s.id === id);
        if (!server) return;
        // Fill in the connection fields in the profile tab (or switch to connect)
        const ipField = document.getElementById('server-ip');
        const portField = document.getElementById('rcon-port');
        const passField = document.getElementById('rcon-pass');
        if (ipField) ipField.value = server.ip;
        if (portField) portField.value = server.port;
        if (passField) passField.value = server.password;
        this.tablet.showToast(`Loaded server: ${server.name}`, 'success');
    }

    deleteServer(id) {
        this.tablet.showConfirm('Delete this server?', (confirmed) => {
            if (confirmed) {
                this.savedServers = this.savedServers.filter(s => s.id !== id);
                this.saveServers();
                this.renderServers();
                this.tablet.showToast('Server deleted', 'info');
            }
        });
    }

    refresh() {
        this.renderServers();
        this.populateUserInfo();
    }

    populateUserInfo() {
        const uname = document.getElementById('profile-username');
        if (uname) uname.innerText = AppState.user.username || 'Not logged in';
        const role = document.getElementById('profile-role');
        if (role) role.innerText = AppState.user.role || 'user';
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.profile = new Profile();
});