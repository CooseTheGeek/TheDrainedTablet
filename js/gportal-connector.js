// gportal-connector.js – DRAINED TABLET ULTIMATE v7.0.0
// Force master detection, save servers, connect via GPortal API.

class GPortalConnector {
    constructor() {
        this.bridgeUrl = AppState.connection.bridgeUrl;
        this.servers = [];
        this.apiReady = false;
        this.connectedServer = null;
        this.init();
    }

    async init() {
        // Force master detection
        const session = localStorage.getItem('tdl_session');
        let isMaster = false;
        if (session) {
            try {
                const sess = JSON.parse(session);
                if (sess.role === 'master' || sess.username === 'CooseTheGeek') isMaster = true;
            } catch(e) {}
        }
        const username = localStorage.getItem('tdl_username');
        if (username === 'CooseTheGeek') isMaster = true;
        this.isMaster = isMaster;
        console.log('GPortalConnector: isMaster =', this.isMaster);
        
        if (this.isMaster) {
            this.loadLocalServers();
        }
        this.createHTML();
        this.attachEvents(); // always attach events; UI may be disabled but buttons still work for master
        await this.checkApiStatus();
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

    async checkApiStatus() {
        try {
            const res = await fetch(`${this.bridgeUrl}/api/health`);
            const data = await res.json();
            this.apiReady = data.rceReady === true;
        } catch (err) {
            this.apiReady = false;
        }
        this.updateApiStatusBadge();
        this.updateHeaderStatus();
    }

    updateApiStatusBadge() {
        const badge = document.querySelector('#gportal-api-status .status-badge');
        if (badge) {
            badge.className = `status-badge ${this.apiReady ? 'online' : 'offline'}`;
            badge.innerText = this.apiReady ? 'Ready' : 'Offline';
        }
    }

    updateHeaderStatus() {
        const statusDot = document.querySelector('#connection-status .dot');
        const statusText = document.getElementById('conn-status-text');
        if (!statusDot || !statusText) return;
        if (this.apiReady && this.connectedServer) {
            statusDot.className = 'dot online';
            statusText.innerText = `CONNECTED (${this.connectedServer.name || 'GPortal'})`;
            AppState.connection.status = 'connected';
        } else if (this.apiReady) {
            statusDot.className = 'dot connecting';
            statusText.innerText = 'READY (GPortal)';
            AppState.connection.status = 'connecting';
        } else {
            statusDot.className = 'dot offline';
            statusText.innerText = 'DISCONNECTED';
            AppState.connection.status = 'disconnected';
        }
        if (window.ConnectionManager) ConnectionManager.notify();
    }

    createHTML() {
        const tab = document.getElementById('tab-gportal');
        if (!tab) return;
        tab.innerHTML = `
            <div class="gportal-container">
                <div class="gportal-header">
                    <h2>🔌 GPORTAL CONNECTOR</h2>
                    <div class="api-status" id="gportal-api-status">
                        API Status: <span class="status-badge">Unknown</span>
                    </div>
                </div>
                <div class="gportal-grid">
                    <div class="gportal-section">
                        <h3>➕ ADD / CONNECT SERVER</h3>
                        <div class="form-group"><label>Server Name:</label><input type="text" id="server-name" placeholder="My Rust Server"></div>
                        <div class="form-group"><label>IP Address:</label><input type="text" id="server-ip" value="144.126.137.59"></div>
                        <div class="form-group"><label>RCON Port:</label><input type="number" id="server-port" value="28916"></div>
                        <div class="form-group"><label>RCON Password:</label><input type="password" id="server-password" value="Myakspray1215!"></div>
                        <button id="save-server-btn" class="gportal-btn primary">💾 SAVE SERVER</button>
                        <button id="connect-saved-btn" class="gportal-btn">🔌 CONNECT SELECTED</button>
                    </div>
                    <div class="gportal-section">
                        <h3>📋 YOUR SERVERS</h3>
                        <div id="servers-list" class="servers-list"></div>
                        <button id="refresh-servers-btn" class="gportal-btn small">🔄 Refresh</button>
                    </div>
                    <div class="gportal-section">
                        <h3>⚡ SEND COMMAND</h3>
                        <div class="form-group"><input type="text" id="gportal-command" placeholder="e.g., status"></div>
                        <button id="gportal-send-command" class="gportal-btn primary">SEND</button>
                        <div id="gportal-command-output" class="command-output"></div>
                    </div>
                </div>
                <div class="gportal-logs"><h3>📋 LOGS</h3><div id="gportal-log-list"></div></div>
            </div>
        `;
    }

    attachEvents() {
        // Attach events regardless of master status; UI elements exist only for master, but we'll still try.
        const saveBtn = document.getElementById('save-server-btn');
        const connectBtn = document.getElementById('connect-saved-btn');
        const sendBtn = document.getElementById('gportal-send-command');
        const refreshBtn = document.getElementById('refresh-servers-btn');
        const commandInput = document.getElementById('gportal-command');
        if (saveBtn) saveBtn.addEventListener('click', (e) => this.saveServer(e));
        if (connectBtn) connectBtn.addEventListener('click', (e) => this.connectSelectedServer(e));
        if (sendBtn) sendBtn.addEventListener('click', (e) => this.sendCommand(e));
        if (refreshBtn) refreshBtn.addEventListener('click', (e) => this.refresh(e));
        if (commandInput) commandInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendCommand(e);
        });
    }

    saveServer(event) {
        if (event) event.preventDefault();
        const name = document.getElementById('server-name').value.trim();
        const ip = document.getElementById('server-ip').value.trim();
        const port = parseInt(document.getElementById('server-port').value);
        const password = document.getElementById('server-password').value;
        if (!name || !ip || !port || !password) {
            toast.error('All fields are required');
            return;
        }
        const newServer = { id: 'server_' + Date.now(), name, ip, port, password };
        this.servers.push(newServer);
        this.saveLocalServers();
        toast.success(`Server "${name}" saved`);
        this.renderServers();
        // Clear form
        document.getElementById('server-name').value = '';
        document.getElementById('server-ip').value = '';
        document.getElementById('server-port').value = '28916';
        document.getElementById('server-password').value = '';
    }

    renderServers() {
        const container = document.getElementById('servers-list');
        if (!container) return;
        if (this.servers.length === 0) {
            container.innerHTML = '<p>No saved servers.</p>';
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

        const connectBtn = container.querySelector('.connect-server-btn');
        const deleteBtn = container.querySelector('.delete-server-btn');
        if (connectBtn) connectBtn.addEventListener('click', () => {
            const select = document.getElementById('server-select');
            const id = select.value;
            const server = this.servers.find(s => s.id === id);
            if (server) this.testConnection(server);
        });
        if (deleteBtn) deleteBtn.addEventListener('click', () => {
            const select = document.getElementById('server-select');
            const id = select.value;
            if (!confirm('Delete this server?')) return;
            this.servers = this.servers.filter(s => s.id !== id);
            this.saveLocalServers();
            this.renderServers();
            toast.info('Server deleted');
        });
    }

    async testConnection(server) {
        this.logMessage(`Testing connection to ${server.name} via GPortal API...`);
        toast.info(`Connecting to ${server.name}...`);
        try {
            const res = await fetch(`${this.bridgeUrl}/api/gportal/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: 'status' })
            });
            const data = await res.json();
            if (data.success) {
                this.connectedServer = server;
                this.apiReady = true;
                this.updateApiStatusBadge();
                this.updateHeaderStatus();
                this.logMessage(`✅ Connected to ${server.name}`);
                toast.success(`Connected to ${server.name}`);
                document.getElementById('gportal-command-output').innerText = data.result || 'Connected';
            } else {
                this.logMessage(`❌ Connection failed: ${data.error}`);
                toast.error(`Connection failed: ${data.error}`);
                this.connectedServer = null;
                this.updateHeaderStatus();
            }
        } catch (err) {
            this.logMessage(`❌ Network error: ${err.message}`);
            toast.error(`Network error: ${err.message}`);
            this.connectedServer = null;
            this.updateHeaderStatus();
        }
    }

    async sendCommand(event) {
        if (event) event.preventDefault();
        if (!this.connectedServer) {
            toast.error('No active connection. Connect to a server first.');
            return;
        }
        const cmd = document.getElementById('gportal-command').value.trim();
        if (!cmd) return;
        this.logMessage(`Sending command: ${cmd}`);
        const outputDiv = document.getElementById('gportal-command-output');
        if (outputDiv) outputDiv.innerText = 'Executing...';
        try {
            const res = await fetch(`${this.bridgeUrl}/api/gportal/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: cmd })
            });
            const data = await res.json();
            if (data.success) {
                outputDiv.innerText = data.result || 'Command executed (no output)';
                this.logMessage(`✅ Command executed`);
            } else {
                outputDiv.innerText = `Error: ${data.error}`;
                this.logMessage(`❌ Command failed: ${data.error}`);
            }
        } catch (err) {
            outputDiv.innerText = `Network error: ${err.message}`;
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
        this.checkApiStatus();
        toast.success('GPortal refreshed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.gportalConnector = new GPortalConnector();
});