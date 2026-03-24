// gportal-connector.js – DRAINED TABLET ULTIMATE v7.0.0
// GPortal connector without Discord (manual server entry).

class GPortalConnector {
    constructor() {
        this.bridgeUrl = AppState.connection.bridgeUrl;
        this.servers = [];
        this.serverIdentifier = 'main-server';
        this.apiReady = false;
        this.lastStatus = null;
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.checkApiStatus();
        this.fetchStatus();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'gportal') {
                this.refresh();
            }
        });
    }

    updateHeaderStatus() {
        const statusEl = document.getElementById('connection-status');
        if (!statusEl) return;
        if (this.apiReady) {
            statusEl.innerHTML = '<span class="dot online"></span> CONNECTED (GPortal)';
        } else {
            statusEl.innerHTML = '<span class="dot offline"></span> DISCONNECTED';
        }
    }

    createHTML() {
        const tab = document.getElementById('tab-gportal');
        if (!tab) return;

        tab.innerHTML = `
            <div class="gportal-container">
                <div class="gportal-header">
                    <h2>🔌 GPORTAL CONNECTOR</h2>
                    <div class="api-status" id="gportal-api-status">
                        API Status: <span class="status-badge ${this.apiReady ? 'online' : 'offline'}">${this.apiReady ? 'Connected' : 'Unknown'}</span>
                    </div>
                </div>

                <div class="gportal-grid">
                    <!-- Add Server Form -->
                    <div class="gportal-section">
                        <h3>➕ ADD SERVER</h3>
                        <div class="form-group">
                            <label>Server Name:</label>
                            <input type="text" id="server-name" placeholder="My Rust Server">
                        </div>
                        <div class="form-group">
                            <label>IP Address:</label>
                            <input type="text" id="server-ip" value="144.126.137.59">
                        </div>
                        <div class="form-group">
                            <label>RCON Port:</label>
                            <input type="number" id="server-port" value="28916">
                        </div>
                        <div class="form-group">
                            <label>RCON Password:</label>
                            <input type="password" id="server-password" value="Thatakspray">
                        </div>
                        <div class="form-group">
                            <label>Server ID (optional):</label>
                            <input type="text" id="server-id" value="1879409">
                        </div>
                        <div class="form-group">
                            <label>Region (int/eur):</label>
                            <input type="text" id="server-region" value="int">
                        </div>
                        <button id="add-server-btn" class="gportal-btn">ADD SERVER</button>
                    </div>

                    <!-- Saved Servers List -->
                    <div class="gportal-section">
                        <h3>📋 YOUR SERVERS</h3>
                        <div id="servers-list" class="servers-list"></div>
                        <button id="refresh-servers-btn" class="gportal-btn small" style="margin-top: 10px;">🔄 Refresh List</button>
                    </div>

                    <!-- Command Execution -->
                    <div class="gportal-section">
                        <h3>⚡ SEND COMMAND</h3>
                        <div class="form-group">
                            <input type="text" id="gportal-command" placeholder="Enter command (e.g., status)">
                        </div>
                        <button id="gportal-send-command" class="gportal-btn primary">SEND COMMAND</button>
                        <div id="gportal-command-output" class="command-output"></div>
                    </div>

                    <!-- Server Status -->
                    <div class="gportal-section">
                        <h3>📊 SERVER STATUS</h3>
                        <pre id="gportal-server-status" class="status-pre">Loading...</pre>
                        <button id="gportal-refresh-status" class="gportal-btn small">🔄 Refresh</button>
                    </div>
                </div>

                <div class="gportal-logs" id="gportal-logs">
                    <h3>📋 CONNECTION LOGS</h3>
                    <div id="gportal-log-list"></div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        const addBtn = document.getElementById('add-server-btn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => this.addServer(e));
        }
        document.getElementById('gportal-send-command')?.addEventListener('click', () => this.sendCommand());
        document.getElementById('gportal-refresh-status')?.addEventListener('click', () => this.fetchStatus());
        const refreshBtn = document.getElementById('refresh-servers-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('Refresh button clicked');
                this.loadServers();
            });
        }
        document.getElementById('gportal-command')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendCommand();
        });
    }

    async addServer(e) {
        const btn = e.currentTarget;
        btn.disabled = true;
        btn.textContent = 'ADDING...';

        const name = document.getElementById('server-name').value.trim();
        const ip = document.getElementById('server-ip').value.trim();
        const port = parseInt(document.getElementById('server-port').value);
        const password = document.getElementById('server-password').value;
        const serverId = document.getElementById('server-id').value.trim();
        const region = document.getElementById('server-region').value.trim();

        if (!name || !ip || !port || !password) {
            toast.error('Name, IP, port, and password are required');
            btn.disabled = false;
            btn.textContent = 'ADD SERVER';
            return;
        }

        this.logMessage(`Adding server ${name}...`);

        const url = `${this.bridgeUrl}/api/user/servers`;
        console.log('Adding server with URL:', url);

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, ip, port, password, server_id: serverId, region })
            });
            const data = await res.json();
            if (data.success) {
                this.logMessage('✅ Server added');
                document.getElementById('server-name').value = '';
                toast.success('Server added successfully');
                await this.loadServers();
            } else {
                this.logMessage(`❌ Failed: ${data.error}`);
                toast.error(data.error || 'Failed to add server');
            }
        } catch (err) {
            console.error('Add server error:', err);
            this.logMessage(`❌ Error: ${err.message}`);
            toast.error('Network error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'ADD SERVER';
        }
    }

    async loadServers() {
        console.log('Loading servers');
        try {
            const res = await fetch(`${this.bridgeUrl}/api/user/servers`);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${await res.text()}`);
            }
            const servers = await res.json();
            console.log('Loaded servers (raw):', servers);
            if (!Array.isArray(servers)) {
                console.error('Server response is not an array:', servers);
                throw new Error('Invalid response format');
            }
            this.servers = servers;
            this.renderServers();
        } catch (err) {
            console.error('Failed to load servers:', err);
            this.logMessage(`❌ Failed to load servers: ${err.message}`);
            const container = document.getElementById('servers-list');
            if (container) {
                container.innerHTML = `<p class="error">Error loading servers: ${err.message}</p>`;
            }
        }
    }

    renderServers() {
        const container = document.getElementById('servers-list');
        if (!container) return;
        if (this.servers.length === 0) {
            container.innerHTML = '<p>No servers added yet.</p>';
            return;
        }
        let html = '';
        this.servers.forEach(s => {
            html += `
                <div class="server-card">
                    <div class="server-name">${s.name}</div>
                    <div class="server-details">${s.ip}:${s.port}</div>
                    <div class="server-actions">
                        <button class="small-btn delete-server" data-id="${s.id}">Delete</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;

        container.querySelectorAll('.delete-server').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm('Delete this server?')) {
                    try {
                        await fetch(`${this.bridgeUrl}/api/user/servers/${id}`, { method: 'DELETE' });
                        this.loadServers();
                        toast.success('Server deleted');
                    } catch (err) {
                        toast.error('Delete failed');
                    }
                }
            });
        });
    }

    async checkApiStatus() {
        try {
            const res = await fetch(`${this.bridgeUrl}/api/gportal/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: 'status' })
            });
            this.apiReady = res.ok;
        } catch {
            this.apiReady = false;
        }
        this.updateApiStatusBadge();
        this.updateHeaderStatus();
    }

    updateApiStatusBadge() {
        const badge = document.querySelector('#gportal-api-status .status-badge');
        if (badge) {
            badge.className = `status-badge ${this.apiReady ? 'online' : 'offline'}`;
            badge.innerText = this.apiReady ? 'Connected' : 'Disconnected';
        }
    }

    async sendCommand() {
        const commandInput = document.getElementById('gportal-command');
        const command = commandInput.value.trim();
        if (!command) return;

        this.logMessage(`Sending command: ${command}`);
        document.getElementById('gportal-command-output').innerText = 'Sending...';

        try {
            const res = await fetch(`${this.bridgeUrl}/api/gportal/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            });
            const data = await res.json();
            if (data.success) {
                const output = data.result || 'Command executed successfully (no output)';
                document.getElementById('gportal-command-output').innerText = output;
                this.logMessage(`✅ Command executed: ${output.substring(0, 100)}...`);
                if (!this.apiReady) {
                    this.apiReady = true;
                    this.updateApiStatusBadge();
                    this.updateHeaderStatus();
                }
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
        const statusDiv = document.getElementById('gportal-server-status');
        if (!statusDiv) return;
        statusDiv.innerText = 'Loading...';
        try {
            const res = await fetch(`${this.bridgeUrl}/api/gportal/status`);
            const data = await res.json();
            if (res.ok) {
                this.lastStatus = data;
                statusDiv.innerText = JSON.stringify(data, null, 2);
                this.logMessage('✅ Server status fetched');
                if (!this.apiReady) {
                    this.apiReady = true;
                    this.updateApiStatusBadge();
                    this.updateHeaderStatus();
                }
            } else {
                statusDiv.innerText = `Error: ${data.error}`;
                this.logMessage(`❌ Status fetch failed: ${data.error}`);
            }
        } catch (err) {
            statusDiv.innerText = `Network error: ${err.message}`;
            this.logMessage(`❌ Network error: ${err.message}`);
        }
    }

    getPlayerCount() {
        if (!this.lastStatus) return 0;
        if (this.lastStatus.players) {
            return Array.isArray(this.lastStatus.players) ? this.lastStatus.players.length : parseInt(this.lastStatus.players) || 0;
        }
        if (this.lastStatus.playerCount) return parseInt(this.lastStatus.playerCount) || 0;
        if (this.lastStatus.numplayers) return parseInt(this.lastStatus.numplayers) || 0;
        return 0;
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
        this.loadServers();
        this.checkApiStatus();
        this.fetchStatus();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.gportalConnector = new GPortalConnector();
});