// gportal-connector.js – DRAINED TABLET ULTIMATE v7.0.0
// GPortal connector with manual server entry and WebRcon connection.

class GPortalConnector {
    constructor() {
        this.bridgeUrl = AppState.connection.bridgeUrl;
        this.servers = [];
        this.currentConnection = null;
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.loadServers();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'gportal') this.refresh();
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-gportal');
        if (!tab) return;
        tab.innerHTML = `
            <div class="gportal-container">
                <div class="gportal-header">
                    <h2>🔌 SERVER CONNECTOR</h2>
                </div>
                <div class="gportal-grid">
                    <div class="gportal-section">
                        <h3>➕ ADD SERVER</h3>
                        <div class="form-group"><label>Server Name:</label><input type="text" id="server-name" placeholder="My Rust Server"></div>
                        <div class="form-group"><label>IP Address:</label><input type="text" id="server-ip" value="144.126.137.59"></div>
                        <div class="form-group"><label>RCON Port:</label><input type="number" id="server-port" value="28916"></div>
                        <div class="form-group"><label>RCON Password:</label><input type="password" id="server-password" value="Thatakspray"></div>
                        <button id="add-server-btn" class="gportal-btn">ADD SERVER</button>
                    </div>
                    <div class="gportal-section">
                        <h3>📋 YOUR SERVERS</h3>
                        <div id="servers-list"></div>
                        <button id="refresh-servers-btn" class="gportal-btn small">🔄 Refresh</button>
                    </div>
                    <div class="gportal-section">
                        <h3>⚡ SEND COMMAND</h3>
                        <div class="form-group"><input type="text" id="gportal-command" placeholder="Enter command (e.g., status)"></div>
                        <button id="gportal-send-command" class="gportal-btn primary">SEND COMMAND</button>
                        <div id="gportal-command-output" class="command-output"></div>
                    </div>
                </div>
                <div class="gportal-logs"><h3>📋 CONNECTION LOGS</h3><div id="gportal-log-list"></div></div>
            </div>
        `;
    }

    attachEvents() {
        document.getElementById('add-server-btn')?.addEventListener('click', (e) => this.addServer(e));
        document.getElementById('refresh-servers-btn')?.addEventListener('click', () => this.loadServers());
        document.getElementById('gportal-send-command')?.addEventListener('click', () => this.sendCommand());
        document.getElementById('gportal-command')?.addEventListener('keypress', (e) => e.key === 'Enter' && this.sendCommand());
    }

    async addServer(e) {
        const btn = e.currentTarget;
        btn.disabled = true;
        btn.textContent = 'ADDING...';
        const name = document.getElementById('server-name').value.trim();
        const ip = document.getElementById('server-ip').value.trim();
        const port = parseInt(document.getElementById('server-port').value);
        const password = document.getElementById('server-password').value;
        if (!name || !ip || !port || !password) {
            toast.error('All fields required');
            btn.disabled = false; btn.textContent = 'ADD SERVER';
            return;
        }
        const username = AppState.user?.username;
        if (!username) {
            toast.error('Not logged in');
            btn.disabled = false; btn.textContent = 'ADD SERVER';
            return;
        }
        try {
            const res = await fetch(`${this.bridgeUrl}/api/user/servers?username=${encodeURIComponent(username)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, ip, port, password })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Server added');
                document.getElementById('server-name').value = '';
                this.loadServers();
            } else {
                toast.error(data.error || 'Failed to add server');
            }
        } catch (err) {
            console.error(err);
            toast.error('Network error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'ADD SERVER';
        }
    }

    async loadServers() {
        const username = AppState.user?.username;
        if (!username) return;
        try {
            const res = await fetch(`${this.bridgeUrl}/api/user/servers?username=${encodeURIComponent(username)}`);
            const servers = await res.json();
            this.servers = servers;
            this.renderServers();
        } catch (err) {
            console.error(err);
        }
    }

    renderServers() {
        const container = document.getElementById('servers-list');
        if (!container) return;
        if (!this.servers.length) {
            container.innerHTML = '<p>No servers added.</p>';
            return;
        }
        container.innerHTML = this.servers.map(s => `
            <div class="server-card">
                <div class="server-name">${s.name}</div>
                <div class="server-details">${s.ip}:${s.port}</div>
                <div class="server-actions">
                    <button class="small-btn connect-server" data-id="${s.id}">🔌 Connect</button>
                    <button class="small-btn delete-server" data-id="${s.id}">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
        container.querySelectorAll('.connect-server').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                const server = this.servers.find(s => s.id == id);
                if (server) await this.connectToServer(server);
            });
        });
        container.querySelectorAll('.delete-server').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                const username = AppState.user?.username;
                if (!username) return;
                if (confirm('Delete this server?')) {
                    try {
                        await fetch(`${this.bridgeUrl}/api/user/servers/${id}?username=${encodeURIComponent(username)}`, { method: 'DELETE' });
                        this.loadServers();
                        toast.success('Server deleted');
                    } catch (err) {
                        toast.error('Delete failed');
                    }
                }
            });
        });
    }

    async connectToServer(server) {
        toast.info(`Connecting to ${server.name}...`);
        try {
            const res = await fetch(`${this.bridgeUrl}/api/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip: server.ip, port: server.port, password: server.password })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Connected to ${server.name}`);
                AppState.connection.status = 'connected';
                AppState.connection.server = data.server;
                localStorage.setItem('tdl_last_credentials', JSON.stringify({ ip: server.ip, port: server.port, password: server.password }));
                document.getElementById('connection-status').innerHTML = '<span class="dot online"></span> CONNECTED';
                if (window.livemap) window.livemap.refresh();
                ConnectionManager.notify();
            } else {
                toast.error(`Connection failed: ${data.error}`);
            }
        } catch (err) {
            toast.error(`Network error: ${err.message}`);
        }
    }

    async sendCommand() {
        const cmd = document.getElementById('gportal-command').value.trim();
        if (!cmd) return;
        if (!AppState.connection.server) {
            toast.error('Not connected to any server');
            return;
        }
        this.logMessage(`Sending: ${cmd}`);
        document.getElementById('gportal-command-output').innerText = 'Sending...';
        try {
            const res = await fetch(`${this.bridgeUrl}/api/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ip: AppState.connection.server.ip,
                    port: AppState.connection.server.port,
                    password: AppState.connection.server.password,
                    command: cmd
                })
            });
            const data = await res.json();
            if (data.success) {
                const output = data.result || 'Command executed';
                document.getElementById('gportal-command-output').innerText = output;
                this.logMessage(`✅ ${output.substring(0, 100)}`);
            } else {
                document.getElementById('gportal-command-output').innerText = `Error: ${data.error}`;
                this.logMessage(`❌ ${data.error}`);
            }
        } catch (err) {
            document.getElementById('gportal-command-output').innerText = `Network error: ${err.message}`;
            this.logMessage(`❌ ${err.message}`);
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
        this.loadServers();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.gportalConnector = new GPortalConnector();
});