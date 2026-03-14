// profile.js – DRAINED TABLET ULTIMATE v7.0.0
// User profile with tabbed interface: ID Card, Customize ID Card, and Settings

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

                <div class="profile-tabs">
                    <button class="profile-tab active" data-tab="idcard">🪪 ID Card</button>
                    <button class="profile-tab" data-tab="customize">🎨 Customize ID Card</button>
                    <button class="profile-tab" data-tab="settings">⚙️ Settings</button>
                </div>

                <!-- ID Card Tab -->
                <div id="profile-idcard" class="profile-tab-content active">
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
                    </div>
                </div>

                <!-- Customize ID Card Tab -->
                <div id="profile-customize" class="profile-tab-content">
                    <div class="customize-card">
                        <h3>Customize Your ID Card</h3>
                        <div class="form-group">
                            <label>Avatar</label>
                            <div class="avatar-controls">
                                <button id="upload-avatar" class="profile-btn">📤 UPLOAD</button>
                                <button id="remove-avatar" class="profile-btn">🗑️ REMOVE</button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Platform</label>
                            <select id="profile-platform">
                                <option value="">Select Platform</option>
                                <option value="ps5" ${AppState.user.platform === 'ps5' ? 'selected' : ''}>PlayStation 5</option>
                                <option value="ps4" ${AppState.user.platform === 'ps4' ? 'selected' : ''}>PlayStation 4</option>
                                <option value="xbox" ${AppState.user.platform === 'xbox' ? 'selected' : ''}>Xbox Series X|S</option>
                                <option value="xboxone" ${AppState.user.platform === 'xboxone' ? 'selected' : ''}>Xbox One</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Platform ID (PSN ID or Xbox Gamertag)</label>
                            <input type="text" id="profile-platform-id" value="${AppState.user.platformId || ''}">
                        </div>
                        <button id="save-profile" class="profile-btn primary">💾 SAVE CHANGES</button>
                    </div>
                </div>

                <!-- Settings Tab -->
                <div id="profile-settings" class="profile-tab-content">
                    <div class="profile-settings">
                        <h3>Connected Accounts</h3>
                        <div class="connection-buttons">
                            <button id="connect-discord" class="connection-btn ${localStorage.getItem('discord_linked') === 'true' ? 'linked' : ''}">
                                <span>🔗</span> Discord ${localStorage.getItem('discord_linked') === 'true' ? '(Linked)' : ''}
                            </button>
                            <button id="connect-gportal" class="connection-btn">
                                <span>🔌</span> GPortal
                            </button>
                        </div>

                        <h3>Saved Servers</h3>
                        <div id="servers-list" class="servers-list"></div>
                        <button id="add-server" class="profile-btn">➕ ADD SERVER</button>

                        <h3>Account Actions</h3>
                        <div class="connection-buttons">
                            <button id="change-password" class="connection-btn">🔐 Change Password</button>
                            <button id="enable-2fa" class="connection-btn">🔒 Enable 2FA</button>
                            <button id="logout-all" class="connection-btn warning">🚪 Logout All Devices</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        // Tab switching
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`profile-${e.target.dataset.tab}`).classList.add('active');
            });
        });

        // Avatar controls
        document.getElementById('upload-avatar')?.addEventListener('click', () => this.uploadAvatar());
        document.getElementById('remove-avatar')?.addEventListener('click', () => this.removeAvatar());

        // Save profile changes
        document.getElementById('save-profile')?.addEventListener('click', () => this.saveProfile());

        // ID card download
        document.getElementById('download-id')?.addEventListener('click', () => this.downloadID());

        // Server management
        document.getElementById('add-server')?.addEventListener('click', () => this.addServer());

        // Connection buttons
        document.getElementById('connect-discord')?.addEventListener('click', () => this.connectDiscord());
        document.getElementById('connect-gportal')?.addEventListener('click', () => this.connectGPortal());
        document.getElementById('change-password')?.addEventListener('click', () => this.changePassword());
        document.getElementById('enable-2fa')?.addEventListener('click', () => this.enable2FA());
        document.getElementById('logout-all')?.addEventListener('click', () => this.logoutAll());

        // Delegate for server actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('load-server')) {
                const id = e.target.dataset.id;
                this.loadServer(id);
            }
            if (e.target.classList.contains('delete-server')) {
                const id = e.target.dataset.id;
                this.deleteServer(id);
            }
        });
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
                document.getElementById('id-card-avatar').innerHTML = this.getAvatarHTML();
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    removeAvatar() {
        AppState.user.avatar = null;
        localStorage.removeItem('tdl_avatar');
        this.updateIDPreview();
        document.getElementById('id-card-avatar').innerHTML = this.getAvatarHTML();
    }

    saveProfile() {
        const platform = document.getElementById('profile-platform').value;
        const platformId = document.getElementById('profile-platform-id').value.trim();
        if (platform && !platformId) {
            toast.error('Platform ID is required when platform is selected');
            return;
        }
        AppState.user.platform = platform || null;
        AppState.user.platformId = platformId || null;
        if (platform) localStorage.setItem('tdl_platform', platform);
        if (platformId) localStorage.setItem('tdl_platform_id', platformId);
        this.updateIDPreview();
        toast.success('Profile saved');
    }

    updateIDPreview() {
        const platform = AppState.user.platform;
        const platformId = AppState.user.platformId;
        const username = AppState.user.username || 'SURVIVOR';
        const role = AppState.user.role || 'user';

        document.getElementById('id-card-avatar').innerHTML = this.getAvatarHTML();
        document.getElementById('id-card-name').innerText = username;
        document.getElementById('id-card-role').innerText = role.toUpperCase();
        document.getElementById('id-card-platform').innerText = platform ? this.getPlatformDisplay(platform) : '';
        document.getElementById('id-card-id').innerText = platformId || '';
    }

    downloadID() {
        // Simple screenshot using html2canvas? For now, just a placeholder.
        toast.info('ID card download feature coming soon');
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
        toast.success('Server saved');
    }

    loadServer(id) {
        const server = this.savedServers.find(s => s.id === id);
        if (!server) return;
        // Fill in the connection fields in the GPortal tab
        const ipField = document.getElementById('server-ip');
        const portField = document.getElementById('server-port');
        const passField = document.getElementById('server-password');
        if (ipField) ipField.value = server.ip;
        if (portField) portField.value = server.port;
        if (passField) passField.value = server.password;
        toast.success(`Loaded server: ${server.name}`);
    }

    deleteServer(id) {
        if (!confirm('Delete this server?')) return;
        this.savedServers = this.savedServers.filter(s => s.id !== id);
        this.saveServers();
        this.renderServers();
        toast.info('Server deleted');
    }

    connectDiscord() {
        window.location.href = 'https://drained-bridge.onrender.com/api/discord/login';
    }

    connectGPortal() {
        // Switch to GPortal tab and maybe auto-fill?
        window.home?.switchToTab('gportal');
        toast.info('Please connect your Discord first in the GPortal tab');
    }

    changePassword() {
        toast.info('Password change feature coming soon');
    }

    enable2FA() {
        if (!window.userManagement) {
            toast.error('User management not available');
            return;
        }
        window.userManagement.enableTotp(AppState.user.username);
    }

    logoutAll() {
        if (!confirm('This will log you out of all devices. Continue?')) return;
        // Clear session and reload
        localStorage.removeItem('tdl_session');
        location.reload();
    }

    refresh() {
        this.renderServers();
        this.populateUserInfo();
        // Update Discord button status
        const discordBtn = document.getElementById('connect-discord');
        if (discordBtn) {
            if (localStorage.getItem('discord_linked') === 'true') {
                discordBtn.classList.add('linked');
                discordBtn.innerHTML = '<span>🔗</span> Discord (Linked)';
            } else {
                discordBtn.classList.remove('linked');
                discordBtn.innerHTML = '<span>🔗</span> Discord';
            }
        }
    }

    populateUserInfo() {
        // This is handled by updateIDPreview on save, but we can call it on refresh
        this.updateIDPreview();
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.profile = new Profile();
});