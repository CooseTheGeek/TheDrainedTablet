// gportal-connector.js – DRAINED TABLET ULTIMATE v7.0.0

class GPortalConnector {
    constructor() {
        this.bridgeUrl = AppState.connection.bridgeUrl;
        this.discordLinked = localStorage.getItem('discord_linked') === 'true';
        this.discordId = localStorage.getItem('discord_id');
        this.servers = [];
        this.serverIdentifier = 'main-server';
        this.apiReady = false;
        this.lastStatus = null;
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.checkDiscordReturn();
        if (this.discordId) {
            this.loadServers();
            this.checkApiStatus();
            this.fetchStatus();
        }
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'gportal') this.refresh();
        });
    }

    updateHeaderStatus() {
        const statusDot = document.querySelector('#connection-status .dot');
        const statusText = document.getElementById('conn-status-text');
        if (!statusDot || !statusText) return;
        if (this.apiReady && this.connectedServer) {
            statusDot.className = 'dot online';
            statusText.innerText = 'CONNECTED (GPortal)';
            AppState.connection.status = 'connected';
        } else if (this.apiReady) {
            statusDot.className = 'dot connecting';
            statusText.innerText = 'CONNECTING...';
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
                        API Status: <span class="status-badge ${this.apiReady ? 'online' : 'offline'}">${this.apiReady ? 'Connected' : 'Unknown'}</span>
                    </div>
                </div>

                <div class="gportal-grid">
                    <div class="gportal-section">
                        <h3>🔗 CONNECT WITH DISCORD</h3>
                        <p>Link your Discord account to manage your servers.</p>
                        <button id="discord-connect-btn" class="gportal-btn primary">
                            ${this.discordLinked ? '✅ Discord Connected' : '🔗 Connect Discord'}
                        </button>
                        ${this.discordLinked ? '<p class="success-message">Discord linked! You can now add your servers below.</p>' : ''}
                    </div>

                    ${this.discordLinked ? `
                    <div class="gportal-section">
                        <h3>➕ ADD SERVER</h3>
                        <div class="form-group"><label>Server Name:</label><input type="text" id="server-name" placeholder="My Rust Server"></div>
                        <div class="form-group"><label>IP Address:</label><input type="text" id="server-ip" value="144.126.137.59"></div>
                        <div class="form-group"><label>RCON Port:</label><input type="number" id="server-port" value="28916"></div>
                        <div class="form-group"><label>RCON Password:</label><input type="password" id="server-password" value="Myakspray1215"></div>
                        <div class="form-group"><label>Server ID (optional):</label><input type="text" id="server-id" value="1879409"></div>
                        <div class="form-group"><label>Region (int/eur):</label><input type="text" id="server-region" value="int"></div>
                        <button id="add-server-btn" class="gportal-btn">ADD SERVER</button>
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
                        <pre id="gportal-server-status" class="status-pre">Loading...</pre>
                        <button id="gportal-refresh-status" class="gportal-btn small">🔄 Refresh</button>
                    </div>
                    ` : ''}
                </div>

                <div class="gportal-logs" id="gportal-logs">
                    <h3>📋 CONNECTION LOGS</h3>
                    <div id="gportal-log-list"></div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        document.getElementById('discord-connect-btn')?.addEventListener('click', () => this.connectDiscord());
        if (this.discordLinked) {
            document.getElementById('add-server-btn')?.addEventListener('click', (e) => this.addServer(e));
            document.getElementById('gportal-send-command')?.addEventListener('click', () => this.sendCommand());
            document.getElementById('gportal-refresh-status')?.addEventListener('click', () => this.fetchStatus());
            document.getElementById('refresh-servers-btn')?.addEventListener('click', () => this.loadServers());
            document.getElementById('gportal-command')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendCommand();
            });
        }
    }

    connectDiscord() {
        window.location.href = `${this.bridgeUrl}/api/discord/login`;
    }

    async addServer(e) {
        if (!this.discordId) { toast.error('You must link Discord first'); return; }
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
            btn.disabled = false; btn.textContent = 'ADD SERVER';
            return;
        }

        this.logMessage(`Adding server ${name}...`);
        try {
            const res = await fetch(`${this.bridgeUrl}/api/user/servers?discord_id=${this.discordId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, ip, port, password, server_id: serverId, region })
            });
            const data = await res.json();
            if (data.success) {
                this.logMessage('✅ Server added');
                toast.success('Server added successfully');
                await this.loadServers();
                // Auto-connect to the newly added server (or first in list)
                this.connectedServer = { ip, port, password, name };
                this.apiReady = true;
                this.updateHeaderStatus();
                this.fetchStatus();
            } else {
                this.logMessage(`❌ Failed: ${data.error}`);
                toast.error(data.error || 'Failed to add server');
            }
        } catch (err) {
            this.logMessage(`❌ Error: ${err.message}`);
            toast.error('Network error');
        } finally {
            btn.disabled = false; btn.textContent = 'ADD SERVER';
        }
    }

    async loadServers() {
        if (!this.discordId) return;
        try {
            const res = await fetch(`${this.bridgeUrl}/api/user/servers?discord_id=${this.discordId}`);
            const servers = await res.json();
            this.servers = servers;
            this.renderServers();
        } catch (err) {
            this.logMessage(`❌ Failed to load servers: ${err.message}`);
        }
    }

    renderServers() {
        const container = document.getElementById('servers-list');
        if (!container) return;
        if (this.servers.length === 0) { container.innerHTML = '<p>No servers added yet.</p>'; return; }
        container.innerHTML = this.servers.map(s => `
            <div class="server-card">
                <div class="server-name">${s.name}</div>
                <div class="server-details">${s.ip}:${s.port}</div>
                <div class="server-actions">
                    <button class="small-btn connect-server" data-ip="${s.ip}" data-port="${s.port}" data-pass="${s.password}" data-name="${s.name}">Connect</button>
                    <button class="small-btn delete-server" data-id="${s.id}">Delete</button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.connect-server').forEach(btn => {
            btn.addEventListener('click', async () => {
                const ip = btn.dataset.ip, port = btn.dataset.port, password = btn.dataset.pass, name = btn.dataset.name;
                this.connectedServer = { ip, port, password, name };
                this.apiReady = true;
                this.updateHeaderStatus();
                await this.fetchStatus();
                toast.success(`Connected to ${name}`);
            });
        });
        container.querySelectorAll('.delete-server').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Delete this server?')) return;
                await fetch(`${this.bridgeUrl}/api/user/servers/${btn.dataset.id}?discord_id=${this.discordId}`, { method: 'DELETE' });
                this.loadServers();
                toast.success('Server deleted');
            });
        });
    }

    async checkApiStatus() {
        try {
            const res = await fetch(`${this.bridgeUrl}/api/gportal/command`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: 'status' })
            });
            this.apiReady = res.ok;
        } catch { this.apiReady = false; }
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
        const cmd = document.getElementById('gportal-command').value.trim();
        if (!cmd) return;
        this.logMessage(`Sending command: ${cmd}`);
        document.getElementById('gportal-command-output').innerText = 'Sending...';
        try {
            const res = await fetch(`${this.bridgeUrl}/api/gportal/command`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: cmd })
            });
            const data = await res.json();
            if (data.success) {
                document.getElementById('gportal-command-output').innerText = data.result || 'Command executed (no output)';
                this.logMessage(`✅ Command executed`);
                if (!this.apiReady) { this.apiReady = true; this.updateApiStatusBadge(); this.updateHeaderStatus(); }
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
                if (!this.apiReady) { this.apiReady = true; this.updateApiStatusBadge(); this.updateHeaderStatus(); }
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
        if (this.lastStatus.players) return Array.isArray(this.lastStatus.players) ? this.lastStatus.players.length : parseInt(this.lastStatus.players) || 0;
        if (this.lastStatus.playerCount) return parseInt(this.lastStatus.playerCount) || 0;
        if (this.lastStatus.numplayers) return parseInt(this.lastStatus.numplayers) || 0;
        return 0;
    }

    checkDiscordReturn() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('discord') === 'linked') {
            const discordId = urlParams.get('id');
            if (discordId) {
                localStorage.setItem('discord_linked', 'true');
                localStorage.setItem('discord_id', discordId);
                window.location.href = window.location.pathname;
            }
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
        this.discordLinked = localStorage.getItem('discord_linked') === 'true';
        this.discordId = localStorage.getItem('discord_id');
        this.createHTML();
        this.attachEvents();
        if (this.discordId) {
            this.loadServers();
            this.checkApiStatus();
            this.fetchStatus();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.gportalConnector = new GPortalConnector();
});