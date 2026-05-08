// profile.js – DRAINED TABLET ULTIMATE v7.0.0
// User profile with tabbed interface: ID Card, Customize ID Card, and Settings
// Enhanced with avatar cropping using Cropper.js, live preview, and persistent storage.
// Updated with default Rust character avatar

class Profile {
    constructor() {
        this.tablet = window.drainedTablet;
        this.auth = window.authSystem;
        this.db = window.database;
        this.savedServers = this.loadServers();
        this.platforms = ['ps5', 'ps4', 'xbox', 'xboxone'];
        this.cropper = null;
        this.init();
    }

    loadServers() {
        const saved = localStorage.getItem('tdl_saved_servers');
        return saved ? JSON.parse(saved) : [];
    }

    saveServers() {
        localStorage.setItem('tdl_saved_servers', JSON.stringify(this.savedServers));
    }

    loadProfileData() {
        const username = AppState.user?.username || 'default';
        const saved = localStorage.getItem(`tdl_profile_${username}`);
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            expires: '05/24/2024',
            portalId: '#523489',
            region: 'North America',
            serverName: 'Geek\'s Survival Base',
            logoText: 'GEEK BASE',
            discordId: 'Geek#1234',
            discordConnected: true,
            tagline: 'NEW GEN | US',
            platform: AppState.user?.platform || '',
            platformId: AppState.user?.platformId || ''
        };
    }

    saveProfileData(data) {
        const username = AppState.user?.username || 'default';
        localStorage.setItem(`tdl_profile_${username}`, JSON.stringify(data));
    }

    init() {
        this.profileData = this.loadProfileData();
        this.createHTML();
        this.attachEvents();
        this.populateUserInfo();
        this.renderServers();
        this.updateHeaderAvatar();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'profile') {
                this.refresh();
            }
        });
    }

    updateHeaderAvatar() {
        const headerAvatar = document.getElementById('profile-avatar');
        if (headerAvatar) {
            headerAvatar.src = AppState.user.avatar || window.DEFAULT_AVATAR;
        }
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
                    <div class="id-card-wrapper">
                        <div class="id-card" id="id-card">
                            <div class="id-card-header">
                                <span class="card-title">⚡ THE DRAINED LAND'S</span>
                                <span class="card-badge">OFFICIAL</span>
                            </div>
                            <div class="card-avatar" id="card-avatar">
                                ${this.getAvatarHTML('large')}
                            </div>
                            <div class="card-username" id="card-username">${AppState.user.username || 'SURVIVOR'}</div>
                            <div class="card-tagline" id="card-tagline">${this.profileData.tagline}</div>
                            <div class="card-metadata">
                                <div class="metadata-item">
                                    <span class="metadata-label">Expires</span>
                                    <span class="metadata-value" id="card-expires">${this.profileData.expires}</span>
                                </div>
                                <div class="metadata-item">
                                    <span class="metadata-label">Portal ID</span>
                                    <span class="metadata-value" id="card-portal-id">${this.profileData.portalId}</span>
                                </div>
                                <div class="metadata-item">
                                    <span class="metadata-label">Region</span>
                                    <span class="metadata-value" id="card-region">${this.profileData.region}</span>
                                </div>
                                <div class="metadata-item">
                                    <span class="metadata-label">Name</span>
                                    <span class="metadata-value" id="card-server-name">${this.profileData.serverName}</span>
                                </div>
                            </div>
                            <div class="card-logo-block">
                                <span class="logo-text" id="card-logo">${this.profileData.logoText}</span>
                            </div>
                            <div class="card-discord">
                                <span class="discord-id" id="card-discord-id">${this.profileData.discordId}</span>
                                <span class="discord-badge" id="card-discord-badge">${this.profileData.discordConnected ? 'DISCORD CONNECTED' : 'DISCORD DISCONNECTED'}</span>
                            </div>
                            <div class="card-actions">
                                <button id="manage-server" class="btn-manage">MANAGE SERVER</button>
                                <button id="delete-server" class="btn-delete">DELETE</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Customize ID Card Tab -->
                <div id="profile-customize" class="profile-tab-content">
                    <div class="two-col">
                        <div class="customize-form">
                            <h3>Customize Your ID Card</h3>
                            <div class="form-section">
                                <h3>Avatar</h3>
                                <div class="form-group">
                                    <div class="avatar-controls">
                                        <img id="custom-avatar-preview" class="avatar-preview-small" src="${AppState.user.avatar || window.DEFAULT_AVATAR}" onerror="this.src=window.DEFAULT_AVATAR">
                                        <div>
                                            <button id="upload-avatar" class="small-btn">📤 Upload</button>
                                            <button id="remove-avatar" class="small-btn">🗑️ Remove</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-section">
                                <h3>Identity</h3>
                                <div class="form-group">
                                    <label>Display Name</label>
                                    <input type="text" id="edit-username" value="${AppState.user.username || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Tagline</label>
                                    <input type="text" id="edit-tagline" value="${this.profileData.tagline}">
                                </div>
                            </div>
                            <div class="form-section">
                                <h3>Server Metadata</h3>
                                <div class="form-group">
                                    <label>Expires</label>
                                    <input type="text" id="edit-expires" value="${this.profileData.expires}">
                                </div>
                                <div class="form-group">
                                    <label>Portal ID</label>
                                    <input type="text" id="edit-portal-id" value="${this.profileData.portalId}">
                                </div>
                                <div class="form-group">
                                    <label>Region</label>
                                    <input type="text" id="edit-region" value="${this.profileData.region}">
                                </div>
                                <div class="form-group">
                                    <label>Server Name</label>
                                    <input type="text" id="edit-server-name" value="${this.profileData.serverName}">
                                </div>
                            </div>
                            <div class="form-section">
                                <h3>Logo Text</h3>
                                <div class="form-group">
                                    <input type="text" id="edit-logo" value="${this.profileData.logoText}">
                                </div>
                            </div>
                            <div class="form-section">
                                <h3>Discord</h3>
                                <div class="form-group">
                                    <label>Discord ID</label>
                                    <input type="text" id="edit-discord-id" value="${this.profileData.discordId}">
                                </div>
                                <div class="checkbox-item">
                                    <label>
                                        <input type="checkbox" id="edit-discord-connected" ${this.profileData.discordConnected ? 'checked' : ''}> Discord Connected
                                    </label>
                                </div>
                            </div>
                            <div class="form-actions">
                                <button id="save-customize" class="btn-save primary">Save Changes</button>
                                <button id="cancel-customize" class="btn-cancel">Cancel</button>
                            </div>
                        </div>
                        <div class="preview-card">
                            <h3 class="preview-title">Live Preview</h3>
                            <div class="preview-id-card" id="preview-id-card">
                                <div class="id-card-header">
                                    <span class="card-title">⚡ THE DRAINED LAND'S</span>
                                    <span class="card-badge">OFFICIAL</span>
                                </div>
                                <div class="card-avatar">
                                    ${this.getAvatarHTML('preview')}
                                </div>
                                <div class="card-username" id="preview-username">${AppState.user.username || 'SURVIVOR'}</div>
                                <div class="card-tagline" id="preview-tagline">${this.profileData.tagline}</div>
                                <div class="card-metadata">
                                    <div class="metadata-item">
                                        <span class="metadata-label">Expires</span>
                                        <span class="metadata-value" id="preview-expires">${this.profileData.expires}</span>
                                    </div>
                                    <div class="metadata-item">
                                        <span class="metadata-label">Portal ID</span>
                                        <span class="metadata-value" id="preview-portal-id">${this.profileData.portalId}</span>
                                    </div>
                                    <div class="metadata-item">
                                        <span class="metadata-label">Region</span>
                                        <span class="metadata-value" id="preview-region">${this.profileData.region}</span>
                                    </div>
                                    <div class="metadata-item">
                                        <span class="metadata-label">Name</span>
                                        <span class="metadata-value" id="preview-server-name">${this.profileData.serverName}</span>
                                    </div>
                                </div>
                                <div class="card-logo-block">
                                    <span class="logo-text" id="preview-logo">${this.profileData.logoText}</span>
                                </div>
                                <div class="card-discord">
                                    <span class="discord-id" id="preview-discord-id">${this.profileData.discordId}</span>
                                    <span class="discord-badge" id="preview-discord-badge">${this.profileData.discordConnected ? 'DISCORD CONNECTED' : 'DISCORD DISCONNECTED'}</span>
                                </div>
                            </div>
                        </div>
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

            <!-- Crop Modal (hidden by default) -->
            <div id="crop-modal" class="modal hidden">
                <div class="modal-content">
                    <h3>✂️ Crop Avatar</h3>
                    <div class="crop-container">
                        <img id="crop-image" src="" alt="Crop">
                    </div>
                    <div class="modal-actions">
                        <button id="crop-save" class="modal-btn primary">Save</button>
                        <button id="crop-cancel" class="modal-btn">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    }

    getAvatarHTML(size = 'large') {
        const avatar = AppState.user.avatar || window.DEFAULT_AVATAR;
        return `<img src="${avatar}" alt="avatar" class="avatar-img" onerror="this.src=window.DEFAULT_AVATAR">`;
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

        // Avatar upload & crop
        document.getElementById('upload-avatar')?.addEventListener('click', () => this.uploadAndCropAvatar());
        document.getElementById('remove-avatar')?.addEventListener('click', () => this.removeAvatar());
        document.getElementById('card-avatar')?.addEventListener('click', () => this.uploadAndCropAvatar());

        // Live preview updates
        document.getElementById('edit-username')?.addEventListener('input', (e) => {
            document.getElementById('preview-username').innerText = e.target.value || 'SURVIVOR';
        });
        document.getElementById('edit-tagline')?.addEventListener('input', (e) => {
            document.getElementById('preview-tagline').innerText = e.target.value;
        });
        document.getElementById('edit-expires')?.addEventListener('input', (e) => {
            document.getElementById('preview-expires').innerText = e.target.value;
        });
        document.getElementById('edit-portal-id')?.addEventListener('input', (e) => {
            document.getElementById('preview-portal-id').innerText = e.target.value;
        });
        document.getElementById('edit-region')?.addEventListener('input', (e) => {
            document.getElementById('preview-region').innerText = e.target.value;
        });
        document.getElementById('edit-server-name')?.addEventListener('input', (e) => {
            document.getElementById('preview-server-name').innerText = e.target.value;
        });
        document.getElementById('edit-logo')?.addEventListener('input', (e) => {
            document.getElementById('preview-logo').innerText = e.target.value;
        });
        document.getElementById('edit-discord-id')?.addEventListener('input', (e) => {
            document.getElementById('preview-discord-id').innerText = e.target.value;
        });
        document.getElementById('edit-discord-connected')?.addEventListener('change', (e) => {
            const badge = document.getElementById('preview-discord-badge');
            badge.innerText = e.target.checked ? 'DISCORD CONNECTED' : 'DISCORD DISCONNECTED';
        });

        // Save/Cancel in Customize tab
        document.getElementById('save-customize')?.addEventListener('click', () => this.saveCustomizations());
        document.getElementById('cancel-customize')?.addEventListener('click', () => {
            document.querySelector('.profile-tab[data-tab="idcard"]').click();
        });

        // Main ID card buttons
        document.getElementById('manage-server')?.addEventListener('click', () => {
            toast.info('Manage Server clicked – implement your logic');
        });
        document.getElementById('delete-server')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this server?')) {
                toast.error('Server deletion triggered');
            }
        });

        // Settings buttons
        document.getElementById('connect-discord')?.addEventListener('click', () => this.connectDiscord());
        document.getElementById('connect-gportal')?.addEventListener('click', () => this.connectGPortal());
        document.getElementById('change-password')?.addEventListener('click', () => this.changePassword());
        document.getElementById('enable-2fa')?.addEventListener('click', () => this.enable2FA());
        document.getElementById('logout-all')?.addEventListener('click', () => this.logoutAll());

        // Server management
        document.getElementById('add-server')?.addEventListener('click', () => this.addServer());

        // Crop modal buttons
        document.getElementById('crop-save')?.addEventListener('click', () => this.saveCroppedAvatar());
        document.getElementById('crop-cancel')?.addEventListener('click', () => this.closeCropModal());

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

    uploadAndCropAvatar() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                this.showCropModal(event.target.result);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    showCropModal(imageSrc) {
        const modal = document.getElementById('crop-modal');
        const img = document.getElementById('crop-image');
        img.src = imageSrc;
        modal.classList.remove('hidden');

        img.onload = () => {
            if (this.cropper) this.cropper.destroy();
            this.cropper = new Cropper(img, {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 1,
                cropBoxResizable: true,
                cropBoxMovable: true,
                background: false
            });
        };
    }

    closeCropModal() {
        const modal = document.getElementById('crop-modal');
        modal.classList.add('hidden');
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
    }

    saveCroppedAvatar() {
        if (!this.cropper) return;
        const canvas = this.cropper.getCroppedCanvas({
            width: 300,
            height: 300,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        const croppedImage = canvas.toDataURL('image/png');
        AppState.user.avatar = croppedImage;
        localStorage.setItem('tdl_avatar', croppedImage);
        this.updateAllAvatars();
        this.closeCropModal();
        toast.success('Avatar updated');
    }

    removeAvatar() {
        AppState.user.avatar = null;
        localStorage.removeItem('tdl_avatar');
        this.updateAllAvatars();
        toast.info('Avatar removed');
    }

    updateAllAvatars() {
        const cardAvatar = document.getElementById('card-avatar');
        if (cardAvatar) cardAvatar.innerHTML = this.getAvatarHTML('large');
        const previewAvatar = document.querySelector('.preview-id-card .card-avatar');
        if (previewAvatar) previewAvatar.innerHTML = this.getAvatarHTML('preview');
        const customPreview = document.getElementById('custom-avatar-preview');
        if (customPreview) {
            if (AppState.user.avatar) {
                customPreview.src = AppState.user.avatar;
                customPreview.style.display = 'inline-block';
            } else {
                customPreview.src = window.DEFAULT_AVATAR;
                customPreview.style.display = 'inline-block';
            }
        }
        this.updateHeaderAvatar();
    }

    saveCustomizations() {
        this.profileData = {
            tagline: document.getElementById('edit-tagline').value,
            expires: document.getElementById('edit-expires').value,
            portalId: document.getElementById('edit-portal-id').value,
            region: document.getElementById('edit-region').value,
            serverName: document.getElementById('edit-server-name').value,
            logoText: document.getElementById('edit-logo').value,
            discordId: document.getElementById('edit-discord-id').value,
            discordConnected: document.getElementById('edit-discord-connected').checked,
            platform: document.getElementById('edit-platform')?.value || '',
            platformId: document.getElementById('edit-platform-id')?.value || ''
        };

        const platformSelect = document.getElementById('edit-platform');
        const platformIdInput = document.getElementById('edit-platform-id');
        if (platformSelect && platformIdInput) {
            AppState.user.platform = platformSelect.value;
            AppState.user.platformId = platformIdInput.value;
            localStorage.setItem('tdl_platform', platformSelect.value);
            localStorage.setItem('tdl_platform_id', platformIdInput.value);
        }

        this.saveProfileData(this.profileData);

        // Update main card
        document.getElementById('card-tagline').innerText = this.profileData.tagline;
        document.getElementById('card-expires').innerText = this.profileData.expires;
        document.getElementById('card-portal-id').innerText = this.profileData.portalId;
        document.getElementById('card-region').innerText = this.profileData.region;
        document.getElementById('card-server-name').innerText = this.profileData.serverName;
        document.getElementById('card-logo').innerText = this.profileData.logoText;
        document.getElementById('card-discord-id').innerText = this.profileData.discordId;
        document.getElementById('card-discord-badge').innerText = this.profileData.discordConnected ? 'DISCORD CONNECTED' : 'DISCORD DISCONNECTED';

        toast.success('ID Card updated');
        document.querySelector('.profile-tab[data-tab="idcard"]').click();
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
        window.switchTab('gportal');
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
        localStorage.removeItem('tdl_session');
        location.reload();
    }

    populateUserInfo() {
        this.updateAllAvatars();
        document.getElementById('card-username').innerText = AppState.user.username || 'SURVIVOR';
        document.getElementById('preview-username').innerText = AppState.user.username || 'SURVIVOR';
        document.getElementById('edit-username').value = AppState.user.username || '';
    }

    refresh() {
        this.renderServers();
        this.populateUserInfo();
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
}

document.addEventListener('DOMContentLoaded', () => {
    window.profile = new Profile();
});

document.addEventListener('DOMContentLoaded', () => {
    const headerAvatar = document.getElementById('profile-avatar');
    if (headerAvatar) {
        headerAvatar.src = AppState.user?.avatar || window.DEFAULT_AVATAR;
    }
});