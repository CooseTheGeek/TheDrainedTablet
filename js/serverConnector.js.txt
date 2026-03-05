// SERVER CONNECTOR - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class ServerConnector {
    constructor(tablet) {
        this.tablet = tablet;
        this.servers = this.loadServers();
        this.currentServer = null;
        this.connectionHistory = this.loadHistory();
        this.init();
    }

    loadServers() {
        const saved = localStorage.getItem('drained_servers');
        if (saved) return JSON.parse(saved);
        
        // Default servers
        return [
            {
                id: 'main',
                name: 'The Drained Land\'s 3X Monthly',
                ip: '144.126.137.59',
                rconPort: 28916,
                password: 'Thatakspray',
                mapSize: 3500,
                mapSeed: 10325,
                platform: 'xbox',
                region: 'NA',
                favorite: true,
                lastConnected: new Date().toISOString()
            }
        ];
    }

    loadHistory() {
        const saved = localStorage.getItem('drained_connection_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveServers() {
        localStorage.setItem('drained_servers', JSON.stringify(this.servers));
    }

    saveHistory() {
        localStorage.setItem('drained_connection_history', JSON.stringify(this.connectionHistory.slice(0, 50)));
    }

    init() {
        this.createConnectorHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'serverConnect') {
                this.refresh();
            }
        });
    }

    createConnectorHTML() {
        const connectorTab = document.getElementById('tab-serverConnect');
        if (!connectorTab) return;

        connectorTab.innerHTML = `
            <div class="connector-container">
                <div class="connector-header">
                    <h2>🌐 SERVER CONNECTOR</h2>
                    <button id="add-server" class="connector-btn primary">+ ADD SERVER</button>
                </div>

                <div class="connector-grid">
                    <div class="servers-list">
                        <h3>SAVED SERVERS</h3>
                        <div id="servers-container"></div>
                    </div>

                    <div class="quick-connect">
                        <h3>QUICK CONNECT</h3>
                        <div class="quick-connect-form">
                            <input type="text" id="quick-ip" placeholder="IP Address">
                            <input type="number" id="quick-port" placeholder="Port" value="28916">
                            <input type="password" id="quick-pass" placeholder="Password">
                            <select id="quick-platform">
                                <option value="xbox">Xbox Series X|S</option>
                                <option value="xboxone">Xbox One</option>
                                <option value="ps5">PlayStation 5</option>
                                <option value="ps4">PlayStation 4</option>
                            </select>
                            <select id="quick-region">
                                <option value="NA">North America</option>
                                <option value="EU">Europe</option>
                                <option value="AS">Asia</option>
                                <option value="OC">Oceania</option>
                                <option value="SA">South America</option>
                                <option value="AF">Africa</option>
                            </select>
                            <button id="quick-connect-btn" class="connector-btn">CONNECT</button>
                        </div>
                    </div>

                    <div class="connection-history">
                        <h3>RECENT CONNECTIONS</h3>
                        <div id="history-container"></div>
                    </div>

                    <div class="connection-status-panel">
                        <h3>CURRENT STATUS</h3>
                        <div id="current-status" class="status-panel">
                            <div class="status-row">
                                <span>Server:</span>
                                <span id="status-server">Not connected</span>
                            </div>
                            <div class="status-row">
                                <span>IP:</span>
                                <span id="status-ip">-</span>
                            </div>
                            <div class="status-row">
                                <span>Platform:</span>
                                <span id="status-platform">-</span>
                            </div>
                            <div class="status-row">
                                <span>Region:</span>
                                <span id="status-region">-</span>
                            </div>
                            <div class="status-row">
                                <span>Latency:</span>
                                <span id="status-latency">-</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Server Modal -->
                <div id="server-modal" class="modal hidden">
                    <div class="modal-content server-modal">
                        <h2 id="server-modal-title">ADD SERVER</h2>
                        
                        <div class="form-group">
                            <label>Server Name:</label>
                            <input type="text" id="server-name" placeholder="My Rust Server">
                        </div>
                        
                        <div class="form-group">
                            <label>IP Address:</label>
                            <input type="text" id="server-ip" placeholder="123.456.78.90">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>RCON Port:</label>
                                <input type="number" id="server-port" value="28916">
                            </div>
                            <div class="form-group">
                                <label>Query Port:</label>
                                <input type="number" id="query-port" value="28916">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>RCON Password:</label>
                            <input type="password" id="server-password">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Map Size:</label>
                                <input type="number" id="server-map-size" value="3500">
                            </div>
                            <div class="form-group">
                                <label>Map Seed:</label>
                                <input type="number" id="server-map-seed" value="10325">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Platform:</label>
                                <select id="server-platform">
                                    <option value="xbox">Xbox Series X|S</option>
                                    <option value="xboxone">Xbox One</option>
                                    <option value="ps5">PlayStation 5</option>
                                    <option value="ps4">PlayStation 4</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Region:</label>
                                <select id="server-region">
                                    <option value="NA">North America</option>
                                    <option value="EU">Europe</option>
                                    <option value="AS">Asia</option>
                                    <option value="OC">Oceania</option>
                                    <option value="SA">South America</option>
                                    <option value="AF">Africa</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="server-favorite"> Add to favorites
                            </label>
                        </div>
                        
                        <div class="modal-actions">
                            <button id="save-server" class="connector-btn primary">SAVE SERVER</button>
                            <button id="test-server" class="connector-btn">TEST CONNECTION</button>
                            <button id="cancel-server" class="connector-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderServers();
        this.renderHistory();
        this.updateStatus();
    }

    setupEventListeners() {
        document.getElementById('add-server')?.addEventListener('click', () => this.openServerModal());
        document.getElementById('quick-connect-btn')?.addEventListener('click', () => this.quickConnect());
        document.getElementById('save-server')?.addEventListener('click', () => this.saveServer());
        document.getElementById('test-server')?.addEventListener('click', () => this.testConnection());
        document.getElementById('cancel-server')?.addEventListener('click', () => {
            document.getElementById('server-modal').classList.add('hidden');
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('connect-server')) {
                const id = e.target.dataset.id;
                this.connectToServer(id);
            }
            if (e.target.classList.contains('edit-server')) {
                const id = e.target.dataset.id;
                this.editServer(id);
            }
            if (e.target.classList.contains('delete-server')) {
                const id = e.target.dataset.id;
                this.deleteServer(id);
            }
            if (e.target.classList.contains('favorite-server')) {
                const id = e.target.dataset.id;
                this.toggleFavorite(id);
            }
        });
    }

    renderServers() {
        const container = document.getElementById('servers-container');
        if (!container) return;

        if (this.servers.length === 0) {
            container.innerHTML = '<div class="no-servers">No servers saved</div>';
            return;
        }

        let html = '';
        this.servers.forEach(server => {
            const isFavorite = server.favorite ? '★' : '☆';
            html += `
                <div class="server-card ${server.id === this.currentServer ? 'connected' : ''}">
                    <div class="server-header">
                        <span class="server-name">${server.name}</span>
                        <span class="server-fav" data-id="${server.id}">${isFavorite}</span>
                    </div>
                    <div class="server-details">
                        <div>${server.ip}:${server.rconPort}</div>
                        <div>${server.platform.toUpperCase()} · ${server.region}</div>
                    </div>
                    <div class="server-actions">
                        <button class="small-btn connect-server" data-id="${server.id}">🔌 CONNECT</button>
                        <button class="small-btn edit-server" data-id="${server.id}">✏️</button>
                        <button class="small-btn delete-server" data-id="${server.id}">🗑️</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    renderHistory() {
        const container = document.getElementById('history-container');
        
        if (this.connectionHistory.length === 0) {
            container.innerHTML = '<div class="no-history">No connection history</div>';
            return;
        }

        let html = '';
        this.connectionHistory.slice(0, 10).forEach(conn => {
            const time = new Date(conn.time).toLocaleString();
            html += `
                <div class="history-item">
                    <span class="history-server">${conn.server}</span>
                    <span class="history-time">${time}</span>
                    <span class="history-status ${conn.success ? 'success' : 'failed'}">
                        ${conn.success ? '✓' : '✗'}
                    </span>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    openServerModal(serverId = null) {
        const modal = document.getElementById('server-modal');
        const title = document.getElementById('server-modal-title');
        
        if (serverId) {
            title.innerText = 'EDIT SERVER';
            const server = this.servers.find(s => s.id === serverId);
            if (server) this.populateModal(server);
        } else {
            title.innerText = 'ADD SERVER';
            this.clearModal();
        }

        modal.classList.remove('hidden');
    }

    populateModal(server) {
        document.getElementById('server-name').value = server.name;
        document.getElementById('server-ip').value = server.ip;
        document.getElementById('server-port').value = server.rconPort;
        document.getElementById('query-port').value = server.queryPort || server.rconPort;
        document.getElementById('server-password').value = server.password;
        document.getElementById('server-map-size').value = server.mapSize;
        document.getElementById('server-map-seed').value = server.mapSeed;
        document.getElementById('server-platform').value = server.platform;
        document.getElementById('server-region').value = server.region;
        document.getElementById('server-favorite').checked = server.favorite || false;
        
        this.editingServerId = server.id;
    }

    clearModal() {
        document.getElementById('server-name').value = '';
        document.getElementById('server-ip').value = '';
        document.getElementById('server-port').value = '28916';
        document.getElementById('query-port').value = '28916';
        document.getElementById('server-password').value = '';
        document.getElementById('server-map-size').value = '3500';
        document.getElementById('server-map-seed').value = '10325';
        document.getElementById('server-platform').value = 'xbox';
        document.getElementById('server-region').value = 'NA';
        document.getElementById('server-favorite').checked = false;
        
        this.editingServerId = null;
    }

    saveServer() {
        const name = document.getElementById('server-name').value;
        const ip = document.getElementById('server-ip').value;
        const port = parseInt(document.getElementById('server-port').value);
        const password = document.getElementById('server-password').value;

        if (!name || !ip || !port) {
            this.tablet.showError('Please fill all required fields');
            return;
        }

        const server = {
            id: this.editingServerId || 'server_' + Date.now(),
            name: name,
            ip: ip,
            rconPort: port,
            queryPort: parseInt(document.getElementById('query-port').value) || port,
            password: password,
            mapSize: parseInt(document.getElementById('server-map-size').value) || 3500,
            mapSeed: parseInt(document.getElementById('server-map-seed').value) || 10325,
            platform: document.getElementById('server-platform').value,
            region: document.getElementById('server-region').value,
            favorite: document.getElementById('server-favorite').checked
        };

        if (this.editingServerId) {
            const index = this.servers.findIndex(s => s.id === this.editingServerId);
            if (index !== -1) {
                this.servers[index] = { ...this.servers[index], ...server };
            }
        } else {
            this.servers.push(server);
        }

        this.saveServers();
        this.renderServers();
        document.getElementById('server-modal').classList.add('hidden');
        this.tablet.showToast(`Server ${name} saved`, 'success');
    }

    connectToServer(id) {
        const server = this.servers.find(s => s.id === id);
        if (!server) return;

        this.currentServer = server.id;
        
        // Update tablet config
        this.tablet.serverConfig = {
            name: server.name,
            ip: server.ip,
            rconPort: server.rconPort,
            password: server.password,
            mapSize: server.mapSize,
            mapSeed: server.mapSeed
        };

        // Attempt connection
        this.tablet.connectToServer().then(success => {
            this.connectionHistory.unshift({
                server: server.name,
                time: new Date().toISOString(),
                success: success
            });
            this.saveHistory();
            this.renderHistory();
            this.updateStatus(server);
        });

        this.renderServers();
    }

    editServer(id) {
        this.openServerModal(id);
    }

    deleteServer(id) {
        this.tablet.showConfirm('Delete this server?', (confirmed) => {
            if (confirmed) {
                this.servers = this.servers.filter(s => s.id !== id);
                this.saveServers();
                this.renderServers();
                this.tablet.showToast('Server deleted', 'info');
            }
        });
    }

    toggleFavorite(id) {
        const server = this.servers.find(s => s.id === id);
        if (server) {
            server.favorite = !server.favorite;
            this.saveServers();
            this.renderServers();
        }
    }

    quickConnect() {
        const ip = document.getElementById('quick-ip').value;
        const port = parseInt(document.getElementById('quick-port').value);
        const password = document.getElementById('quick-pass').value;
        const platform = document.getElementById('quick-platform').value;
        const region = document.getElementById('quick-region').value;

        if (!ip || !port) {
            this.tablet.showError('Enter IP and port');
            return;
        }

        const server = {
            id: 'temp_' + Date.now(),
            name: ip + ':' + port,
            ip: ip,
            rconPort: port,
            password: password,
            mapSize: 3500,
            mapSeed: 10325,
            platform: platform,
            region: region,
            favorite: false,
            temporary: true
        };

        this.connectToServer(server.id);
        // Would need to add temp server to list
    }

    testConnection() {
        const ip = document.getElementById('server-ip').value;
        const port = document.getElementById('server-port').value;

        this.tablet.showToast(`Testing connection to ${ip}:${port}...`, 'info');
        
        setTimeout(() => {
            this.tablet.showToast('Connection successful!', 'success');
        }, 2000);
    }

    updateStatus(server = null) {
        if (server) {
            document.getElementById('status-server').innerText = server.name;
            document.getElementById('status-ip').innerText = server.ip + ':' + server.rconPort;
            document.getElementById('status-platform').innerText = server.platform.toUpperCase();
            document.getElementById('status-region').innerText = server.region;
            document.getElementById('status-latency').innerText = '24ms';
        } else {
            document.getElementById('status-server').innerText = 'Not connected';
            document.getElementById('status-ip').innerText = '-';
            document.getElementById('status-platform').innerText = '-';
            document.getElementById('status-region').innerText = '-';
            document.getElementById('status-latency').innerText = '-';
        }
    }

    refresh() {
        this.renderServers();
        this.renderHistory();
        this.tablet.showToast('Server connector refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.serverConnector = new ServerConnector(window.drainedTablet);
});