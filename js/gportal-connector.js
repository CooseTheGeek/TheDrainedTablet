// gportal-connector.js – DRAINED TABLET ULTIMATE v7.0.0
// Master: direct RCON entry, saves servers locally, connects and updates AppState.connection.

class GPortalConnector {
    constructor() {
        this.bridgeUrl = AppState.connection.bridgeUrl;
        this.servers = [];
        this.connectedServer = null;
        this.init();
    }

    async init() {
        const username = AppState.user?.username || localStorage.getItem('tdl_username');
        this.isMaster = username === 'CooseTheGeek';
        
        if (this.isMaster) {
            this.loadLocalServers();
        }
        
        this.createHTML();
        this.attachEvents();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'gportal') this.refresh();
        });
    }

    loadLocalServers() {
        const saved = localStorage.getItem('tdl_master_servers');
        this.servers = saved ? JSON.parse(saved) : [];
    }

    saveLocalServers() {
        localStorage.setItem('tdl_master_servers', JSON.stringify(this.servers));
    }

    updateHeaderStatus(connected = false, serverName = '') {
        const statusDot = document.querySelector('#connection-status .dot');
        const statusText = document.getElementById('conn-status-text');
        if (!statusDot || !statusText) return;
        
        if (connected && this.connectedServer) {
            statusDot.className = 'dot online';
            statusText.innerText = `CONNECTED (${this.connectedServer.name || 'Server'})`;
            AppState.connection.status = 'connected';
            AppState.connection.server = {
                ip: this.connectedServer.ip,
                port: this.connectedServer.port,
                password: this.connectedServer.password,
                name: this.connectedServer.name
            };
            if (window.ConnectionManager) ConnectionManager.notify();
        } else {
            statusDot.className = 'dot offline';
            statusText.innerText = 'DISCONNECTED';
            AppState.connection.status = 'disconnected';
            AppState.connection.server = null;
            if (window.ConnectionManager) ConnectionManager.notify();
        }
    }

    createHTML() {
        const tab = document.getElementById('tab-gportal');
        if (!tab) return;

        tab.innerHTML = `
            <div class="gportal-container">
                <div class="gportal-header">
                    <h2>🔌 SERVER CONNECTOR (RCON)</h2>
                    <div class="api-status" id="gportal-api-status">
                        Status: <span class="status-badge">Ready</span>
                    </div>
                </div>
                <div class="gportal-grid">
                    <div class="gportal-section">
                        <h3>➕ ADD / CONNECT SERVER (RCON)</h3>
                        <div class="form-group"><label>Server Name:</label><input type="text" id="server-name" placeholder="My Rust Server"></div>
                        <div class="form-group"><label>IP Address:</label><input type="text" id="server-ip" placeholder="144.126.137.59"></div>
                        <div class="form-group"><label>RCON Port:</label><input type="number" id="server-port" value="28916"></div>
                        <div class="form-group"><label>RCON Password:</label><input type="password" id="server-password" placeholder="Myakspray1215"></div>
                        <div class="form-group"><label>Server ID (optional):</label><input type="text" id="server-id" placeholder="1879409"></div>
                        <div class="form-group"><label>Region:</label><input type="text" id="server-region" placeholder="int"></div>
                        <button id="save-server-btn" class="gportal-btn primary">💾 SAVE SERVER</button>
                        <button id="connect-saved-btn" class="gportal-btn" style="margin-top:0.5rem;">🔌 CONNECT SELECTED</button>
                    </div>

                    <div class="gportal-section">
                        <h3>📋 YOUR SERVERS</h3>
                        <div id="servers-list" class="servers-list"></div>
                        <button id="refresh-servers-btn" class="gportal-btn small">🔄 Refresh List</button>
                    </div>

                    <div class="gportal-section">
                        <h3>⚡ SEND COMMAND</h3>
                        <div class="form-group"><input type="text" id="gportal-command" placeholder="Enter command (e.g., status)"></div>
                        <button id="gportal-send-command" class="gportal-btn primary">SEND COMMAND</button>
                        <div id="gportal-command-output" class="command-output"></div>
                    </div>

                    <div class="gportal-section">
                        <h3>📊 SERVER STATUS</h3>
                        <pre id="gportal-server-status" class="status-pre">Not connected</pre>
                        <button id="gportal-refresh-status" class="gportal-btn small">🔄 Refresh</button>
                    </div>
                </div>
                <div class="gportal-logs"><h3>📋 CONNECTION LOGS</h3><div id="gportal-log-list"></div></div>
            </div>
        `;
    }

    attachEvents() {
        if (!this.isMaster) return;
        
        document.getElementById('save-server-btn')?.addEventListener('click', () => this.saveServer());
        document.getElementById('connect-saved-btn')?.addEventListener('click', () => this.connectSelectedServer());
        document.getElementById('gportal-send-command')?.addEventListener('click', () => this.sendCommand());
        document.getElementById('gportal-refresh-status')?.addEventListener('click', () => this.fetchStatus());
        document.getElementById('refresh-servers-btn')?.addEventListener('click', () => this.refresh());
        document.getElementById('gportal-command')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendCommand();
        });
    }

    saveServer() {
        const name = document.getElementById('server-name').value.trim();
        const ip = document.getElementById('server-ip').value.trim();
        const port = parseInt(document.getElementById('server-port').value);
        const password = document.getElementById('server-password').value;
        const serverId = document.getElementById('server-id').value.trim();
        const region = document.getElementById('server-region').value.trim();

        if (!name || !ip || !port || !password) {
            toast.error('Name, IP, port, and password required');
            return;
        }

        const newServer = { id: 'server_' + Date.now(), name, ip, port, password, server_id: serverId, region };
        this.servers.push(newServer);
        this.saveLocalServers();
        toast.success(`Server "${name}" saved locally`);
        this.renderServers();
    }

    async connectSelectedServer() {
        const select = document.getElementById('server-select');
        if (!select || !select.value) { toast.error('Select a server first'); return; }
        const serverId = select.value;
        const server = this.servers.find(s => s.id === serverId);
        if (!server) return;
        
        this.connectedServer = { name: server.name, ip: server.ip, port: server.port, password: server.password };
        await this.testConnection(server.ip, server.port, server.password);
    }

    async testConnection(ip, port, password) {
        try {
            const res = await fetch(`${this.bridgeUrl}/api/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip, port, password, command: 'status' })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Connection successful');
                this.updateHeaderStatus(true, this.connectedServer.name);
                await this.fetchStatus();
            } else {
                toast.error('Connection failed: ' + (data.error || 'Unknown error'));
                this.updateHeaderStatus(false);
            }
        } catch (err) {
            toast.error('Connection error: ' + err.message);
            this.updateHeaderStatus(false);
        }
    }

    renderServers() {
        const container = document.getElementById('servers-list');
        if (!container) return;
        if (this.servers.length === 0) {
            container.innerHTML = '<p>No servers saved. Add one above.</p>';
            return;
        }
        let html = '<select id="server-select" style="width:100%; margin-bottom:0.5rem;">';
        this.servers.forEach(s => {
            html += `<option value="${s.id}">${s.name} (${s.ip}:${s.port})</option>`;
        });
        html += '</select><div style="display:flex; gap:0.5rem;">';
        html += `<button class="small-btn connect-server-btn">🔌 Connect</button>`;
        html += `<button class="small-btn delete-server-btn">🗑️ Delete</button></div>`;
        container.innerHTML = html;

        container.querySelector('.connect-server-btn')?.addEventListener('click', () => {
            const id = document.getElementById('server-select').value;
            const server = this.servers.find(s => s.id === id);
            if (server) {
                this.connectedServer = { name: server.name, ip: server.ip, port: server.port, password: server.password };
                this.testConnection(server.ip, server.port, server.password);
            }
        });

        container.querySelector('.delete-server-btn')?.addEventListener('click', () => {
            const id = document.getElementById('server-select').value;
            if (!confirm('Delete this server?')) return;
            this.servers = this.servers.filter(s => s.id !== id);
            this.saveLocalServers();
            this.renderServers();
            toast.success('Server deleted');
            if (this.connectedServer && this.connectedServer.id === id) {
                this.connectedServer = null;
                this.updateHeaderStatus(false);
            }
        });
    }

    async sendCommand() {
        if (!this.connectedServer) { toast.error('No server connected'); return; }
        const cmd = document.getElementById('gportal-command').value.trim();
        if (!cmd) return;
        this.logMessage(`Sending: ${cmd}`);
        document.getElementById('gportal-command-output').innerText = 'Sending...';
        try {
            const res = await fetch(`${this.bridgeUrl}/api/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip: this.connectedServer.ip, port: this.connectedServer.port, password: this.connectedServer.password, command: cmd })
            });
            const data = await res.json();
            if (data.success) {
                document.getElementById('gportal-command-output').innerText = data.result || 'Command executed (no output)';
                this.logMessage(`✅ Command executed`);
            } else {
                document.getElementById('gportal-command-output').innerText = `Error: ${data.error}`;
                this.logMessage(`❌ Command failed: ${data.error}`);
            }
        } catch (err) {
            document.getElementById('gportal-command-output').innerText = `Network error: ${err.message}`;
            this.logMessage(`❌ Network error: ${err.message}`);
        }
    }

    async fetchStatus() {
        if (!this.connectedServer) { document.getElementById('gportal-server-status').innerText = 'Not connected'; return; }
        const statusDiv = document.getElementById('gportal-server-status');
        statusDiv.innerText = 'Fetching...';
        try {
            const res = await fetch(`${this.bridgeUrl}/api/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip: this.connectedServer.ip, port: this.connectedServer.port, password: this.connectedServer.password, command: 'status' })
            });
            const data = await res.json();
            if (data.success) {
                statusDiv.innerText = data.result || 'No output';
                this.logMessage('✅ Status fetched');
            } else {
                statusDiv.innerText = `Error: ${data.error}`;
                this.logMessage(`❌ Status failed: ${data.error}`);
            }
        } catch (err) {
            statusDiv.innerText = `Network error: ${err.message}`;
            this.logMessage(`❌ Network error: ${err.message}`);
        }
    }

    logMessage(msg) {
        const list = document.getElementById('gportal-log-list');
        if (!list) return;
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        list.prepend(entry);
        if (list.children.length > 20) list.removeChild(list.lastChild);
    }

    refresh() {
        if (this.isMaster) {
            this.loadLocalServers();
            this.renderServers();
        }
        this.updateHeaderStatus(this.connectedServer !== null);
        toast.success('GPortal refreshed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.gportalConnector = new GPortalConnector();
});