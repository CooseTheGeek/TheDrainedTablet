// gportal-connector.js – DRAINED TABLET ULTIMATE v7.0.0
// Complete GPortal connector with Discord linking, server storage, command execution,
// and global connection status integration.

class GPortalConnector {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.bridgeUrl = AppState.connection.bridgeUrl;
        this.discordLinked = localStorage.getItem('discord_linked') === 'true';
        this.discordId = localStorage.getItem('discord_id');
        this.servers = [];
        this.serverIdentifier = 'main-server'; // matches the identifier used in the bridge
        this.apiReady = false;
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.checkDiscordReturn();
        if (this.discordId) {
            this.loadServers();
            this.checkApiStatus();
        }
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'gportal') {
                this.refresh();
            }
        });
    }

    updateGlobalConnectionStatus() {
        if (this.apiReady) {
            AppState.connection.status = 'connected';
            AppState.connection.server = { 
                ip: 'GPortal API', 
                port: 0, 
                password: '',
                name: 'GPortal'
            };
            const statusEl = document.getElementById('connection-status');
            if (statusEl) {
                statusEl.innerHTML = '<span class="dot online"></span> CONNECTED (GPortal)';
            }
        } else {
            AppState.connection.status = 'disconnected';
            AppState.connection.server = null;
            const statusEl = document.getElementById('connection-status');
            if (statusEl) {
                statusEl.innerHTML = '<span class="dot offline"></span> DISCONNECTED';
            }
        }
        if (window.ConnectionManager) {
            window.ConnectionManager.notify();
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
                    <!-- Discord Connect Section -->
                    <div class="gportal-section">
                        <h3>🔗 CONNECT WITH DISCORD</h3>
                        <p>Link your Discord account to manage your servers.</p>
                        <button id="discord-connect-btn" class="gportal-btn primary">
                            ${this.discordLinked ? '✅ Discord Connected' : '🔗 Connect Discord'}
                        </button>
                        ${this.discordLinked ? '<p class="success-message">Discord linked! You can now add your servers below.</p>' : ''}
                    </div>

                    ${this.discordLinked ? `
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
            const addBtn = document.getElementById('add-server-btn');
            if (addBtn) {
                addBtn.addEventListener('click', (e) => this.addServer(e));
            }
            document.getElementById('gportal-send-command')?.addEventListener('click', () => this.sendCommand());
            document.getElementById('gportal-refresh-status')?.addEventListener('click', () => this.fetchStatus());
            const refreshBtn = document.getElementById('refresh-servers-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => this.loadServers());
            }
            document.getElementById('gportal-command')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendCommand();
            });
        }
    }

    connectDiscord() {
        window.location.href = `${this.bridgeUrl}/api/discord/login`;
    }

    async addServer(e) {
        const btn = e.currentTarget;
        btn.disabled = true;
        const name = document.getElementById('server-name').value.trim();
        const ip = document.getElementById('server-ip').value.trim();
        const port = parseInt(document.getElementById('server-port').value);
        const password = document.getElementById('server-password').value;
        const serverId = document.getElementById('server-id').value.trim();
        const region = document.getElementById('server-region').value.trim();

        if (!name || !ip || !port || !password) {
            this.tablet.showError('Name, IP, port, and password are required');
            btn.disabled = false;
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
                document.getElementById('server-name').value = ''; // clear name
                // Wait a tiny bit for the database to commit, then refresh
                setTimeout(() => this.loadServers(), 300);
            } else {
                this.logMessage(`❌ Failed: ${data.error}`);
                this.tablet.showError(data.error || 'Failed to add server');
            }
        } catch (err) {
            this.logMessage(`❌ Error: ${err.message}`);
            this.tablet.showError('Network error');
        } finally {
            btn.disabled = false;
        }
    }

    async loadServers() {
        if (!this.discordId) return;
        try {
            const res = await fetch(`${this.bridgeUrl}/api/user/servers?discord_id=${this.discordId}`);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const servers = await res.json();
            console.log('Loaded servers:', servers); // for debugging
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

        // Attach delete events (they need to be reattached after innerHTML update)
        container.querySelectorAll('.delete-server').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm('Delete this server?')) {
                    try {
                        await fetch(`${this.bridgeUrl}/api/user/servers/${id}?discord_id=${this.discordId}`, { method: 'DELETE' });
                        this.loadServers();
                    } catch (err) {
                        this.tablet.showError('Delete failed');
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
        this.updateGlobalConnectionStatus();
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
                    this.updateGlobalConnectionStatus();
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
        statusDiv.innerText = 'Loading...';
        try {
            const res = await fetch(`${this.bridgeUrl}/api/gportal/status`);
            const data = await res.json();
            if (res.ok) {
                statusDiv.innerText = JSON.stringify(data, null, 2);
                this.logMessage('✅ Server status fetched');
                if (!this.apiReady) {
                    this.apiReady = true;
                    this.updateApiStatusBadge();
                    this.updateGlobalConnectionStatus();
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

    checkDiscordReturn() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('discord') === 'linked') {
            const discordId = urlParams.get('id');
            if (discordId) {
                localStorage.setItem('discord_linked', 'true');
                localStorage.setItem('discord_id', discordId);
                this.discordLinked = true;
                this.discordId = discordId;
                toast.success('Discord linked successfully!');
                window.history.replaceState({}, '', window.location.pathname);
                this.refresh();
                this.loadServers();
            } else {
                toast.error('Discord linking failed: no ID received');
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

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gportalConnector = new GPortalConnector();
});