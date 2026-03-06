// PROFILE TAB - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek)
// REAL SERVER CONNECTION - NO MOCK DATA

class ProfileTab {
    constructor() {
        this.tablet = window.drainedTablet;
        this.savedServers = this.loadServers();
        
        this.init();
    }

    init() {
        console.log('ProfileTab initializing...');
        this.createProfileHTML();
        this.setupEventListeners();
        this.loadServerList();
    }

    createProfileHTML() {
        const profileTab = document.getElementById('tab-owner');
        if (!profileTab) {
            console.error('Profile tab element not found');
            return;
        }

        profileTab.innerHTML = `
            <div class="profile-container">
                <div class="profile-header">
                    <h2>👤 SERVER PROFILE</h2>
                </div>

                <div class="profile-grid">
                    <!-- Connection Panel -->
                    <div class="profile-section connection-panel">
                        <h3>🔌 SERVER CONNECTION</h3>
                        
                        <div class="form-group">
                            <label>Server IP:</label>
                            <input type="text" id="server-ip" value="${this.tablet.serverConfig.ip}" placeholder="123.456.78.90">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>RCON Port:</label>
                                <input type="number" id="rcon-port" value="${this.tablet.serverConfig.rconPort}" placeholder="28916">
                            </div>
                            <div class="form-group">
                                <label>Query Port:</label>
                                <input type="number" id="query-port" value="28916" placeholder="28916">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>RCON Password:</label>
                            <input type="password" id="rcon-pass" value="${this.tablet.serverConfig.password}" placeholder="Password">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Map Size:</label>
                                <input type="number" id="map-size" value="${this.tablet.serverConfig.mapSize}" placeholder="3500">
                            </div>
                            <div class="form-group">
                                <label>Map Seed:</label>
                                <input type="number" id="map-seed" value="${this.tablet.serverConfig.mapSeed}" placeholder="10325">
                            </div>
                        </div>
                        
                        <div class="button-group">
                            <button id="test-connection" class="profile-btn">🔄 TEST CONNECTION</button>
                            <button id="connect-server" class="profile-btn primary">🔌 CONNECT</button>
                            <button id="save-server" class="profile-btn">💾 SAVE SERVER</button>
                        </div>
                        
                        <div id="connection-result" class="connection-result">
                            <p>Ready to connect</p>
                        </div>
                    </div>

                    <!-- Saved Servers Panel -->
                    <div class="profile-section saved-servers-panel">
                        <h3>📋 SAVED SERVERS</h3>
                        <div id="saved-servers-list" class="saved-servers-list"></div>
                    </div>

                    <!-- Quick Stats Panel -->
                    <div class="profile-section stats-panel">
                        <h3>📊 QUICK STATS</h3>
                        <div class="stat-row">
                            <span>Current User:</span>
                            <span id="stat-user">${this.tablet.currentUser || 'Not logged in'}</span>
                        </div>
                        <div class="stat-row">
                            <span>Connection Status:</span>
                            <span id="stat-connection" class="${this.tablet.connected ? 'online' : 'offline'}">${this.tablet.connected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                        <div class="stat-row">
                            <span>Last Connected:</span>
                            <span id="stat-last">${this.getLastConnected()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getLastConnected() {
        const last = localStorage.getItem('drained_last_connected');
        return last ? new Date(last).toLocaleString() : 'Never';
    }

    setupEventListeners() {
        console.log('Setting up profile event listeners');
        
        document.getElementById('test-connection')?.addEventListener('click', () => this.testConnection());
        document.getElementById('connect-server')?.addEventListener('click', () => this.connect());
        document.getElementById('save-server')?.addEventListener('click', () => this.saveCurrentServer());
    }

    loadServers() {
        const saved = localStorage.getItem('drained_servers');
        return saved ? JSON.parse(saved) : [
            {
                id: 'main',
                name: 'The Drained Land\'s 3X Monthly',
                ip: '144.126.137.59',
                port: 28916,
                password: 'Thatakspray',
                mapSize: 3500,
                mapSeed: 10325
            }
        ];
    }

    saveServers() {
        localStorage.setItem('drained_servers', JSON.stringify(this.savedServers));
    }

    loadServerList() {
        const listDiv = document.getElementById('saved-servers-list');
        if (!listDiv) return;

        if (this.savedServers.length === 0) {
            listDiv.innerHTML = '<div class="no-servers">No saved servers</div>';
            return;
        }

        let html = '';
        this.savedServers.forEach(server => {
            html += `
                <div class="saved-server-card">
                    <div class="server-info">
                        <div class="server-name">${server.name}</div>
                        <div class="server-address">${server.ip}:${server.port}</div>
                    </div>
                    <div class="server-actions">
                        <button class="small-btn load-server" data-id="${server.id}">📂 LOAD</button>
                        <button class="small-btn delete-server" data-id="${server.id}">🗑️</button>
                    </div>
                </div>
            `;
        });

        listDiv.innerHTML = html;

        // Add load buttons
        listDiv.querySelectorAll('.load-server').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.loadServer(id);
            });
        });

        // Add delete buttons
        listDiv.querySelectorAll('.delete-server').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.deleteServer(id);
            });
        });
    }

    loadServer(id) {
        const server = this.savedServers.find(s => s.id === id);
        if (!server) return;

        document.getElementById('server-ip').value = server.ip;
        document.getElementById('rcon-port').value = server.port;
        document.getElementById('rcon-pass').value = server.password;
        document.getElementById('map-size').value = server.mapSize;
        document.getElementById('map-seed').value = server.mapSeed;

        this.tablet.showToast(`Loaded server: ${server.name}`, 'success');
    }

    deleteServer(id) {
        this.tablet.showConfirm('Delete this server?', (confirmed) => {
            if (confirmed) {
                this.savedServers = this.savedServers.filter(s => s.id !== id);
                this.saveServers();
                this.loadServerList();
                this.tablet.showToast('Server deleted', 'info');
            }
        });
    }

    async testConnection() {
        const ip = document.getElementById('server-ip').value;
        const port = document.getElementById('rcon-port').value;
        const password = document.getElementById('rcon-pass').value;

        const resultDiv = document.getElementById('connection-result');
        resultDiv.innerHTML = '<p>Testing connection...</p>';

        // Temporarily set the config for testing
        const originalConfig = { ...this.tablet.serverConfig };
        this.tablet.serverConfig.ip = ip;
        this.tablet.serverConfig.rconPort = parseInt(port);
        this.tablet.serverConfig.password = password;

        const success = await this.tablet.connectToServer();
        
        if (success) {
            resultDiv.innerHTML = `<p style="color: var(--success);">✓ Connection successful to ${ip}:${port}</p>`;
            localStorage.setItem('drained_last_connected', new Date().toISOString());
        } else {
            resultDiv.innerHTML = `<p style="color: var(--error);">✗ Connection failed - check credentials</p>`;
            // Restore original config
            this.tablet.serverConfig = originalConfig;
        }
    }

    async connect() {
        const ip = document.getElementById('server-ip').value;
        const port = document.getElementById('rcon-port').value;
        const password = document.getElementById('rcon-pass').value;

        // Update tablet config
        this.tablet.serverConfig.ip = ip;
        this.tablet.serverConfig.rconPort = parseInt(port);
        this.tablet.serverConfig.password = password;

        const success = await this.tablet.connectToServer();
        
        const resultDiv = document.getElementById('connection-result');
        if (success) {
            resultDiv.innerHTML = '<p style="color: var(--success);">✓ Connected to server</p>';
            localStorage.setItem('drained_last_connected', new Date().toISOString());
            
            // Update stats panel
            document.getElementById('stat-connection').innerText = 'Connected';
            document.getElementById('stat-connection').className = 'online';
        } else {
            resultDiv.innerHTML = '<p style="color: var(--error);">✗ Connection failed</p>';
            document.getElementById('stat-connection').innerText = 'Disconnected';
            document.getElementById('stat-connection').className = 'offline';
        }
    }

    saveCurrentServer() {
        const server = {
            id: 'server_' + Date.now(),
            name: prompt('Enter a name for this server:', 'Custom Server') || 'Custom Server',
            ip: document.getElementById('server-ip').value,
            port: parseInt(document.getElementById('rcon-port').value),
            password: document.getElementById('rcon-pass').value,
            mapSize: parseInt(document.getElementById('map-size').value) || 3500,
            mapSeed: parseInt(document.getElementById('map-seed').value) || 10325
        };

        this.savedServers.push(server);
        this.saveServers();
        this.loadServerList();
        this.tablet.showToast('Server saved', 'success');
    }

    refresh() {
        this.loadServerList();
        document.getElementById('stat-user').innerText = this.tablet.currentUser || 'Not logged in';
        document.getElementById('stat-connection').innerText = this.tablet.connected ? 'Connected' : 'Disconnected';
        document.getElementById('stat-connection').className = this.tablet.connected ? 'online' : 'offline';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.profileTab = new ProfileTab();
});
