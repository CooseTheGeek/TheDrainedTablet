// gportal-connector.js – DRAINED TABLET ULTIMATE v7.0.0
// Uses the existing rcon-bridge to execute commands.

class GPortalConnector {
    constructor() {
        this.bridgeUrl = AppState.connection.bridgeUrl;
        this.servers = [];
        this.activeServer = null;  // currently connected server
        this.init();
    }

    async init() {
        const username = AppState.user?.username || localStorage.getItem('tdl_username');
        this.isMaster = username === 'CooseTheGeek';
        if (this.isMaster) this.loadLocalServers();
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
        if (connected && this.activeServer) {
            statusDot.className = 'dot online';
            statusText.innerText = `CONNECTED (${serverName})`;
            AppState.connection.status = 'connected';
            AppState.connection.server = this.activeServer;
            ConnectionManager.notify();
        } else {
            statusDot.className = 'dot offline';
            statusText.innerText = 'DISCONNECTED';
            AppState.connection.status = 'disconnected';
            AppState.connection.server = null;
            ConnectionManager.notify();
        }
    }

    createHTML() {
        const tab = document.getElementById('tab-gportal');
        if (!tab) return;
        tab.innerHTML = `
            <div class="gportal-container">
                <div class="gportal-header"><h2>🔌 SERVER CONNECTOR (RCON)</h2></div>
                <div class="gportal-grid">
                    <div class="gportal-section">
                        <h3>➕ ADD / CONNECT SERVER</h3>
                        <div class="form-group"><label>Server Name:</label><input type="text" id="server-name" placeholder="My Rust Server"></div>
                        <div class="form-group"><label>IP Address:</label><input type="text" id="server-ip" placeholder="144.126.137.59"></div>
                        <div class="form-group"><label>RCON Port:</label><input type="number" id="server-port" value="28916"></div>
                        <div class="form-group"><label>RCON Password:</label><input type="password" id="server-password" placeholder="Myakspray1215"></div>
                        <button id="save-server-btn" class="gportal-btn primary">💾 SAVE SERVER</button>
                        <button id="connect-saved-btn" class="gportal-btn" style="margin-top:0.5rem;">🔌 CONNECT SELECTED</button>
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
        if (!this.isMaster) return;
        document.getElementById('save-server-btn')?.addEventListener('click', () => this.saveServer());
        document.getElementById('connect-saved-btn')?.addEventListener('click', () => this.connectSelectedServer());
        document.getElementById('gportal-send-command')?.addEventListener('click', () => this.sendCommand());
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
        if (!name || !ip || !port || !password) {
            toast.error('All fields are required');
            return;
        }
        const newServer = { id: 'server_' + Date.now(), name, ip, port, password };
        this.servers.push(newServer);
        this.saveLocalServers();
        toast.success(`Server "${name}" saved`);
        this.renderServers();
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

        container.querySelector('.connect-server-btn')?.addEventListener('click', () => {
            const id = document.getElementById('server-select').value;
            const server = this.servers.find(s => s.id === id);
            if (server) this.testConnection(server);
        });
        container.querySelector('.delete-server-btn')?.addEventListener('click', () => {
            const id = document.getElementById('server-select').value;
            if (!confirm('Delete this server?')) return;
            this.servers = this.servers.filter(s => s.id !== id);
            this.saveLocalServers();
            this.renderServers();
            toast.info('Server deleted');
            if (this.activeServer && this.activeServer.id === id) {
                this.activeServer = null;
                this.updateHeaderStatus(false);
            }
        });
    }

    async testConnection(server) {
        this.logMessage(`Testing connection to ${server.name} (${server.ip}:${server.port})...`);
        try {
            const res = await fetch(`${this.bridgeUrl}/api/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ip: server.ip,
                    port: server.port,
                    password: server.password,
                    command: 'status'
                })
            });
            const data = await res.json();
            if (data.success) {
                this.activeServer = server;
                this.updateHeaderStatus(true, server.name);
                this.logMessage(`✅ Connected to ${server.name}`);
                toast.success(`Connected to ${server.name}`);
                // Optional: display server info
                document.getElementById('gportal-command-output').innerText = data.result || 'Connected';
            } else {
                this.logMessage(`❌ Connection failed: ${data.error}`);
                toast.error(`Connection failed: ${data.error}`);
                this.activeServer = null;
                this.updateHeaderStatus(false);
            }
        } catch (err) {
            this.logMessage(`❌ Network error: ${err.message}`);
            toast.error(`Network error: ${err.message}`);
            this.activeServer = null;
            this.updateHeaderStatus(false);
        }
    }

    async sendCommand() {
        if (!this.activeServer) {
            toast.error('No active connection. Connect to a server first.');
            return;
        }
        const cmd = document.getElementById('gportal-command').value.trim();
        if (!cmd) return;
        this.logMessage(`Sending command: ${cmd}`);
        document.getElementById('gportal-command-output').innerText = 'Executing...';
        try {
            const res = await fetch(`${this.bridgeUrl}/api/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ip: this.activeServer.ip,
                    port: this.activeServer.port,
                    password: this.activeServer.password,
                    command: cmd
                })
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
        toast.success('GPortal refreshed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.gportalConnector = new GPortalConnector();
});