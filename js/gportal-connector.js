// gportal-connector.js – DRAINED TABLET ULTIMATE v7.0.0
// Enhanced GPortal connector with proper status updates, Discord linking, and server management.

class GPortalConnector {
    constructor() {
        this.bridgeUrl = AppState.connection.bridgeUrl;
        this.discordLinked = localStorage.getItem('discord_linked') === 'true';
        this.discordId = localStorage.getItem('discord_id');
        this.servers = [];
        this.serverIdentifier = 'main-server';
        this.apiReady = false;
        this.lastStatus = null;
        this.statusInterval = null;
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
            // Refresh status every 30 seconds
            this.statusInterval = setInterval(() => this.fetchStatus(), 30000);
        }
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
            // Update AppState for legacy modules
            AppState.connection.status = 'connected';
            AppState.connection.server = AppState.connection.server || { 
                ip: 'GPortal', 
                port: 0, 
                maxPlayers: this.lastStatus?.MaxPlayers || 100 
            };
            ConnectionManager.notify();
        } else {
            statusEl.innerHTML = '<span class="dot offline"></span> DISCONNECTED';
            AppState.connection.status = 'disconnected';
            ConnectionManager.notify();
        }
    }

    createHTML() {
        const tab = document.getElementById('tab-gportal');
        if (!tab) return;

        tab.innerHTML = `
            <div class="gportal-container">
                <div class="gportal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="color: var(--accent-primary);">🔌 GPORTAL CONNECTOR</h2>
                    <div class="api-status" id="gportal-api-status">
                        API Status: <span class="status-badge ${this.apiReady ? 'online' : 'offline'}">${this.apiReady ? 'Connected' : 'Unknown'}</span>
                    </div>
                </div>

                <div class="gportal-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                    <!-- Discord Connect Section -->
                    <div class="gportal-section" style="background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: 16px; padding: 1.5rem;">
                        <h3 style="color: var(--accent-primary); margin-bottom: 1rem;">🔗 CONNECT WITH DISCORD</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 1rem;">Link your Discord account to manage your servers.</p>
                        <button id="discord-connect-btn" class="gportal-btn primary" style="width: 100%; padding: 0.8rem; background: var(--accent-primary); color: #000; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;">
                            ${this.discordLinked ? '✅ Discord Connected' : '🔗 Connect Discord'}
                        </button>
                        ${this.discordLinked ? '<p class="success-message" style="color: var(--success); margin-top: 0.5rem;">Discord linked! You can now add your servers below.</p>' : ''}
                        ${this.discordLinked && this.servers.length === 0 ? '<p class="info-message" style="color: var(--info); margin-top: 0.5rem;">No servers found. Please add your server.</p>' : ''}
                    </div>

                    ${this.discordLinked ? `
                    <!-- Add Server Form -->
                    <div class="gportal-section" style="background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: 16px; padding: 1.5rem;">
                        <h3 style="color: var(--accent-primary); margin-bottom: 1rem;">➕ ADD SERVER</h3>
                        <div class="form-group" style="margin-bottom: 0.8rem;">
                            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary);">Server Name:</label>
                            <input type="text" id="server-name" placeholder="My Rust Server" style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 8px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 0.8rem;">
                            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary);">IP Address:</label>
                            <input type="text" id="server-ip" value="144.126.137.59" style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 8px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 0.8rem;">
                            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary);">RCON Port:</label>
                            <input type="number" id="server-port" value="28916" style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 8px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 0.8rem;">
                            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary);">RCON Password:</label>
                            <input type="password" id="server-password" value="Thatakspray" style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 8px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 0.8rem;">
                            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary);">Server ID (optional):</label>
                            <input type="text" id="server-id" value="1879409" style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 8px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 0.8rem;">
                            <label style="display: block; margin-bottom: 0.3rem; color: var(--text-secondary);">Region (int/eur):</label>
                            <input type="text" id="server-region" value="int" style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 8px;">
                        </div>
                        <button id="add-server-btn" class="gportal-btn" style="width: 100%; padding: 0.8rem; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 8px; cursor: pointer; transition: background 0.2s;">ADD SERVER</button>
                    </div>

                    <!-- Saved Servers List -->
                    <div class="gportal-section" style="background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: 16px; padding: 1.5rem;">
                        <h3 style="color: var(--accent-primary); margin-bottom: 1rem;">📋 YOUR SERVERS</h3>
                        <div id="servers-list" class="servers-list" style="max-height: 200px; overflow-y: auto; margin-bottom: 0.5rem;"></div>
                        <button id="refresh-servers-btn" class="gportal-btn small" style="padding: 0.4rem 1rem; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 20px; cursor: pointer;">🔄 Refresh List</button>
                    </div>

                    <!-- Command Execution -->
                    <div class="gportal-section" style="background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: 16px; padding: 1.5rem;">
                        <h3 style="color: var(--accent-primary); margin-bottom: 1rem;">⚡ SEND COMMAND</h3>
                        <div class="form-group" style="margin-bottom: 0.8rem;">
                            <input type="text" id="gportal-command" placeholder="Enter command (e.g., status)" style="width: 100%; padding: 0.6rem; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 8px;">
                        </div>
                        <button id="gportal-send-command" class="gportal-btn primary" style="width: 100%; padding: 0.8rem; background: var(--accent-primary); color: #000; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">SEND COMMAND</button>
                        <div id="gportal-command-output" class="command-output" style="margin-top: 1rem; padding: 0.8rem; background: var(--bg-secondary); border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; max-height: 150px; overflow-y: auto;"></div>
                    </div>

                    <!-- Server Status -->
                    <div class="gportal-section" style="background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: 16px; padding: 1.5rem;">
                        <h3 style="color: var(--accent-primary); margin-bottom: 1rem;">📊 SERVER STATUS</h3>
                        <pre id="gportal-server-status" class="status-pre" style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; overflow-x: auto; max-height: 200px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem;">Loading...</pre>
                        <button id="gportal-refresh-status" class="gportal-btn small" style="margin-top: 0.5rem; padding: 0.4rem 1rem; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 20px; cursor: pointer;">🔄 Refresh</button>
                    </div>
                    ` : ''}
                </div>

                <div class="gportal-logs" style="margin-top: 1.5rem; background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: 16px; padding: 1.5rem;">
                    <h3 style="color: var(--accent-primary); margin-bottom: 1rem;">📋 CONNECTION LOGS</h3>
                    <div id="gportal-log-list" style="max-height: 150px; overflow-y: auto;"></div>
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
                refreshBtn.addEventListener('click', () => {
                    console.log('Refresh button clicked');
                    this.loadServers();
                });
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
        if (!this.discordId) {
            toast.error('You must link Discord first');
            return;
        }
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

        const url = `${this.bridgeUrl}/api/user/servers?discord_id=${this.discordId}`;
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
        if (!this.discordId) {
            console.warn('loadServers called with no discordId');
            return;
        }
        console.log('Loading servers for discordId:', this.discordId);
        try {
            const res = await fetch(`${this.bridgeUrl}/api/user/servers?discord_id=${this.discordId}`);
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
                container.innerHTML = `<p class="error" style="color: var(--error);">Error loading servers: ${err.message}</p>`;
            }
        }
    }

    renderServers() {
        const container = document.getElementById('servers-list');
        if (!container) return;
        if (this.servers.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No servers added yet.</p>';
            return;
        }
        let html = '';
        this.servers.forEach(s => {
            html += `
                <div class="server-card" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid var(--glass-border);">
                    <div>
                        <div style="font-weight: 600;">${s.name}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${s.ip}:${s.port}</div>
                    </div>
                    <div>
                        <button class="small-btn delete-server" data-id="${s.id}" style="background: var(--error); color: #fff; border: none; border-radius: 4px; padding: 0.2rem 0.5rem; cursor: pointer;">Delete</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;

        container.querySelectorAll('.delete-server').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (!this.discordId) return;
                const id = e.currentTarget.dataset.id;
                if (confirm('Delete this server?')) {
                    try {
                        await fetch(`${this.bridgeUrl}/api/user/servers/${id}?discord_id=${this.discordId}`, { method: 'DELETE' });
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
            this.updateHeaderStatus();
            this.updateApiStatusBadge();
        } catch {
            this.apiReady = false;
            this.updateHeaderStatus();
        }
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
        const outputDiv = document.getElementById('gportal-command-output');
        outputDiv.innerText = 'Sending...';

        try {
            const res = await fetch(`${this.bridgeUrl}/api/gportal/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            });
            const data = await res.json();
            if (data.success) {
                const output = data.result || 'Command executed successfully (no output)';
                outputDiv.innerText = output;
                this.logMessage(`✅ Command executed: ${output.substring(0, 100)}...`);
                if (!this.apiReady) {
                    this.apiReady = true;
                    this.updateApiStatusBadge();
                    this.updateHeaderStatus();
                }
            } else {
                outputDiv.innerText = `Error: ${data.error}`;
                this.logMessage(`❌ Command failed: ${data.error}`);
            }
        } catch (err) {
            outputDiv.innerText = `Network error: ${err.message}`;
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

    checkDiscordReturn() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('discord') === 'linked') {
            const discordId = urlParams.get('id');
            console.log('Discord return detected, ID:', discordId);
            if (discordId) {
                localStorage.setItem('discord_linked', 'true');
                localStorage.setItem('discord_id', discordId);
                console.log('Saved to localStorage:', { linked: 'true', id: discordId });
                window.location.href = window.location.pathname;
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
        entry.style.padding = '0.2rem 0';
        entry.style.borderBottom = '1px solid var(--glass-border)';
        entry.style.fontSize = '0.85rem';
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
        this.updateHeaderStatus();
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gportalConnector = new GPortalConnector();
});