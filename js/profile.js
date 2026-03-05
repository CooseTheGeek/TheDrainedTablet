// PROFILE TAB - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class ProfileTab {
    constructor(tablet) {
        this.tablet = tablet;
        this.profile = this.loadProfile();
        this.savedServers = this.loadServers();
        this.avatar = null;
        this.init();
    }

    loadProfile() {
        const saved = localStorage.getItem('drained_profile');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default profile with your server
        return {
            serverName: "The Drained Land's 3X Monthly",
            ip: "144.126.137.59",
            rconPort: 28916,
            password: "Thatakspray",
            mapSize: 3500,
            mapSeed: 10325,
            owner: "CooseTheGeek",
            avatar: null
        };
    }

    loadServers() {
        const saved = localStorage.getItem('drained_servers');
        if (saved) {
            return JSON.parse(saved);
        }
        
        // Default saved servers
        return [
            {
                id: 'main',
                name: "The Drained Land's 3X Monthly",
                ip: "144.126.137.59",
                rconPort: 28916,
                password: "Thatakspray",
                mapSize: 3500,
                mapSeed: 10325,
                favorite: true
            }
        ];
    }

    saveProfile() {
        localStorage.setItem('drained_profile', JSON.stringify(this.profile));
        this.tablet.showToast('Profile saved', 'success');
    }

    saveServers() {
        localStorage.setItem('drained_servers', JSON.stringify(this.savedServers));
    }

    init() {
        this.createProfileHTML();
        this.setupEventListeners();
        this.loadAvatar();
    }

    createProfileHTML() {
        const profileTab = document.getElementById('tab-profile');
        if (!profileTab) return;

        profileTab.innerHTML = `
            <div class="profile-container">
                <div class="profile-header">
                    <h2>SERVER PROFILE</h2>
                    <p>Configure your server connection and branding</p>
                </div>
                
                <div class="profile-grid">
                    <!-- Left Column - Avatar -->
                    <div class="profile-left">
                        <div class="avatar-section">
                            <div class="avatar-container" id="avatar-container">
                                <div class="avatar" id="profile-avatar">
                                    <svg width="150" height="150" viewBox="0 0 150 150">
                                        <circle cx="75" cy="75" r="70" fill="#1a1a1a" stroke="#FFB100" stroke-width="2"/>
                                        <circle cx="75" cy="55" r="20" fill="#000" stroke="#FFB100" stroke-width="2"/>
                                        <path d="M45 100 Q75 120 105 100" stroke="#FFB100" stroke-width="3" fill="none"/>
                                    </svg>
                                </div>
                                <div class="avatar-controls">
                                    <button id="upload-avatar-btn" class="profile-btn">UPLOAD</button>
                                    <button id="remove-avatar-btn" class="profile-btn">REMOVE</button>
                                </div>
                            </div>
                            <p class="avatar-hint">Click upload to select PNG/JPG/GIF</p>
                        </div>
                        
                        <div class="profile-stats">
                            <h4>ACCOUNT INFO</h4>
                            <div class="stat-item">
                                <span class="stat-label">Owner:</span>
                                <span class="stat-value">${this.profile.owner || 'CooseTheGeek'}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Joined:</span>
                                <span class="stat-value">2026-01-15</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Last Login:</span>
                                <span class="stat-value">Today</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Column - Server Settings -->
                    <div class="profile-right">
                        <div class="settings-section">
                            <h3>SERVER CONFIGURATION</h3>
                            
                            <div class="form-group">
                                <label for="server-name">Server Name:</label>
                                <input type="text" id="server-name" value="${this.profile.serverName}" placeholder="Your server name">
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="server-ip">IP Address:</label>
                                    <input type="text" id="server-ip" value="${this.profile.ip}" placeholder="123.456.78.90">
                                </div>
                                <div class="form-group">
                                    <label for="rcon-port">RCON Port:</label>
                                    <input type="number" id="rcon-port" value="${this.profile.rconPort}" placeholder="28916">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="rcon-password">RCON Password:</label>
                                <input type="password" id="rcon-password" value="${this.profile.password}" placeholder="Enter password">
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="map-size">Map Size:</label>
                                    <input type="number" id="map-size" value="${this.profile.mapSize}" placeholder="3500">
                                </div>
                                <div class="form-group">
                                    <label for="map-seed">Map Seed:</label>
                                    <input type="number" id="map-seed" value="${this.profile.mapSeed}" placeholder="10325">
                                </div>
                            </div>
                            
                            <div class="profile-actions">
                                <button id="test-connection-btn" class="profile-btn primary">TEST CONNECTION</button>
                                <button id="save-profile-btn" class="profile-btn">SAVE PROFILE</button>
                                <button id="sign-in-server-btn" class="profile-btn success">SIGN IN TO SERVER</button>
                            </div>
                            
                            <div class="connection-status" id="profile-connection-status">
                                <span class="status-indicator">⚫</span>
                                <span class="status-text">Not connected</span>
                            </div>
                        </div>
                        
                        <div class="saved-servers-section">
                            <h3>SAVED SERVERS</h3>
                            <div id="saved-servers-list" class="saved-servers-list"></div>
                            <button id="add-server-btn" class="profile-btn secondary">+ ADD NEW SERVER</button>
                        </div>
                    </div>
                </div>
                
                <!-- Branding Preview -->
                <div class="branding-preview">
                    <h3>PREVIEW</h3>
                    <div class="preview-card">
                        <div class="preview-header">
                            <span class="preview-title" id="preview-server-name">${this.profile.serverName}</span>
                            <span class="preview-status">🟢 ONLINE</span>
                        </div>
                        <div class="preview-content">
                            <div class="preview-avatar">
                                <svg width="40" height="40" viewBox="0 0 40 40">
                                    <circle cx="20" cy="20" r="18" fill="#1a1a1a" stroke="#FFB100" stroke-width="1"/>
                                </svg>
                            </div>
                            <div class="preview-info">
                                <div>IP: ${this.profile.ip}:${this.profile.rconPort}</div>
                                <div>Map: ${this.profile.mapSize} - ${this.profile.mapSeed}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.updateSavedServersList();
    }

    setupEventListeners() {
        // Avatar buttons
        document.getElementById('upload-avatar-btn')?.addEventListener('click', () => this.uploadAvatar());
        document.getElementById('remove-avatar-btn')?.addEventListener('click', () => this.removeAvatar());

        // Profile actions
        document.getElementById('test-connection-btn')?.addEventListener('click', () => this.testConnection());
        document.getElementById('save-profile-btn')?.addEventListener('click', () => this.saveCurrentProfile());
        document.getElementById('sign-in-server-btn')?.addEventListener('click', () => this.signInToServer());

        // Add server
        document.getElementById('add-server-btn')?.addEventListener('click', () => this.addNewServer());

        // Real-time preview updates
        document.getElementById('server-name')?.addEventListener('input', (e) => {
            document.getElementById('preview-server-name').innerText = e.target.value || 'Server Name';
        });
    }

    uploadAvatar() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png, image/jpeg, image/gif';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.avatar = event.target.result;
                    this.updateAvatarDisplay();
                    this.tablet.showToast('Avatar uploaded', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }

    removeAvatar() {
        this.avatar = null;
        this.updateAvatarDisplay();
        this.tablet.showToast('Avatar removed', 'info');
    }

    updateAvatarDisplay() {
        const avatarContainer = document.getElementById('profile-avatar');
        if (this.avatar) {
            avatarContainer.innerHTML = `<img src="${this.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        } else {
            avatarContainer.innerHTML = `
                <svg width="150" height="150" viewBox="0 0 150 150">
                    <circle cx="75" cy="75" r="70" fill="#1a1a1a" stroke="#FFB100" stroke-width="2"/>
                    <circle cx="75" cy="55" r="20" fill="#000" stroke="#FFB100" stroke-width="2"/>
                    <path d="M45 100 Q75 120 105 100" stroke="#FFB100" stroke-width="3" fill="none"/>
                </svg>
            `;
        }
    }

    async testConnection() {
        const ip = document.getElementById('server-ip').value;
        const port = document.getElementById('rcon-port').value;
        const password = document.getElementById('rcon-password').value;

        this.updateConnectionStatus('🟡', 'Testing connection...');

        // Simulate connection test
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (ip === '144.126.137.59' && port === '28916' && password === 'Thatakspray') {
            this.updateConnectionStatus('🟢', 'Connected successfully');
            this.tablet.showToast('Connection successful!', 'success');
        } else {
            this.updateConnectionStatus('🔴', 'Connection failed');
            this.tablet.showToast('Connection failed', 'error');
        }
    }

    updateConnectionStatus(indicator, text) {
        const statusEl = document.getElementById('profile-connection-status');
        if (statusEl) {
            statusEl.innerHTML = `
                <span class="status-indicator">${indicator}</span>
                <span class="status-text">${text}</span>
            `;
        }
    }

    saveCurrentProfile() {
        this.profile = {
            serverName: document.getElementById('server-name').value,
            ip: document.getElementById('server-ip').value,
            rconPort: parseInt(document.getElementById('rcon-port').value),
            password: document.getElementById('rcon-password').value,
            mapSize: parseInt(document.getElementById('map-size').value),
            mapSeed: parseInt(document.getElementById('map-seed').value),
            owner: 'CooseTheGeek',
            avatar: this.avatar
        };

        this.saveProfile();
        
        // Update tablet config
        this.tablet.serverConfig = {
            name: this.profile.serverName,
            ip: this.profile.ip,
            rconPort: this.profile.rconPort,
            password: this.profile.password,
            mapSize: this.profile.mapSize,
            mapSeed: this.profile.mapSeed
        };
    }

    async signInToServer() {
        this.saveCurrentProfile();
        this.updateConnectionStatus('🟡', 'Connecting...');
        
        const success = await this.tablet.connectToServer();
        
        if (success) {
            this.updateConnectionStatus('🟢', 'Connected to ' + this.profile.ip);
        } else {
            this.updateConnectionStatus('🔴', 'Connection failed');
        }
    }

    addNewServer() {
        const newServer = {
            id: 'server_' + Date.now(),
            name: 'New Server',
            ip: '0.0.0.0',
            rconPort: 28916,
            password: '',
            mapSize: 3500,
            mapSeed: Math.floor(Math.random() * 99999),
            favorite: false
        };

        this.savedServers.push(newServer);
        this.saveServers();
        this.updateSavedServersList();
        this.tablet.showToast('Server added', 'success');
    }

    updateSavedServersList() {
        const listEl = document.getElementById('saved-servers-list');
        if (!listEl) return;

        if (this.savedServers.length === 0) {
            listEl.innerHTML = '<div class="no-servers">No saved servers</div>';
            return;
        }

        let html = '';
        this.savedServers.forEach(server => {
            html += `
                <div class="saved-server-item ${server.favorite ? 'favorite' : ''}">
                    <div class="server-info">
                        <span class="server-name">${server.name}</span>
                        <span class="server-ip">${server.ip}:${server.rconPort}</span>
                    </div>
                    <div class="server-actions">
                        <button class="server-btn load" onclick="profileTab.loadServer('${server.id}')">LOAD</button>
                        <button class="server-btn edit" onclick="profileTab.editServer('${server.id}')">EDIT</button>
                        <button class="server-btn delete" onclick="profileTab.deleteServer('${server.id}')">DELETE</button>
                        <button class="server-btn favorite" onclick="profileTab.toggleFavorite('${server.id}')">
                            ${server.favorite ? '★' : '☆'}
                        </button>
                    </div>
                </div>
            `;
        });

        listEl.innerHTML = html;
    }

    loadServer(serverId) {
        const server = this.savedServers.find(s => s.id === serverId);
        if (!server) return;

        document.getElementById('server-name').value = server.name;
        document.getElementById('server-ip').value = server.ip;
        document.getElementById('rcon-port').value = server.rconPort;
        document.getElementById('rcon-password').value = server.password;
        document.getElementById('map-size').value = server.mapSize;
        document.getElementById('map-seed').value = server.mapSeed;

        this.tablet.showToast('Loaded server: ' + server.name, 'success');
    }

    editServer(serverId) {
        const server = this.savedServers.find(s => s.id === serverId);
        if (!server) return;

        // Open edit modal (simplified for now)
        const newName = prompt('Edit server name:', server.name);
        if (newName) {
            server.name = newName;
            this.saveServers();
            this.updateSavedServersList();
            this.tablet.showToast('Server updated', 'success');
        }
    }

    deleteServer(serverId) {
        this.tablet.showConfirm('Delete this server?', (confirmed) => {
            if (confirmed) {
                this.savedServers = this.savedServers.filter(s => s.id !== serverId);
                this.saveServers();
                this.updateSavedServersList();
                this.tablet.showToast('Server deleted', 'info');
            }
        });
    }

    toggleFavorite(serverId) {
        const server = this.savedServers.find(s => s.id === serverId);
        if (server) {
            server.favorite = !server.favorite;
            this.saveServers();
            this.updateSavedServersList();
        }
    }

    loadAvatar() {
        if (this.profile.avatar) {
            this.avatar = this.profile.avatar;
            this.updateAvatarDisplay();
        }
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.profileTab = new ProfileTab(window.drainedTablet);
});