// gportal-connector.js – DRAINED TABLET ULTIMATE v7.0.0
// Handles GPortal connection with Discord linking and server storage.

class GPortalConnector {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.bridgeUrl = AppState.connection.bridgeUrl;
        this.discordLinked = localStorage.getItem('discord_linked') === 'true';
        this.discordId = localStorage.getItem('discord_id'); // we'll store after OAuth
        this.servers = [];
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.checkDiscordReturn();
        if (this.discordId) {
            this.loadServers();
        }
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'gportal') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-gportal');
        if (!tab) return;

        tab.innerHTML = `
            <div class="gportal-container">
                <div class="gportal-header">
                    <h2>🔌 GPORTAL CONNECTOR</h2>
                    <div class="connection-status" id="gportal-status">⚫ Not Connected</div>
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
            document.getElementById('add-server-btn')?.addEventListener('click', () => this.addServer());
        }
    }

    connectDiscord() {
        window.location.href = `${this.bridgeUrl}/api/discord/login`;
    }

    async addServer() {
        const name = document.getElementById('server-name').value.trim();
        const ip = document.getElementById('server-ip').value.trim();
        const port = parseInt(document.getElementById('server-port').value);
        const password = document.getElementById('server-password').value;
        const serverId = document.getElementById('server-id').value.trim();
        const region = document.getElementById('server-region').value.trim();

        if (!name || !ip || !port || !password) {
            this.tablet.showError('Name, IP, port, and password are required');
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
                this.loadServers();
            } else {
                this.logMessage(`❌ Failed: ${data.error}`);
            }
        } catch (err) {
            this.logMessage(`❌ Error: ${err.message}`);
        }
    }

    async loadServers() {
        try {
            const res = await fetch(`${this.bridgeUrl}/api/user/servers?discord_id=${this.discordId}`);
            const servers = await res.json();
            this.servers = servers;
            this.renderServers();
        } catch (err) {
            console.error('Failed to load servers:', err);
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
                        <button class="small-btn connect-server" data-id="${s.id}" data-ip="${s.ip}" data-port="${s.port}" data-password="***">Connect</button>
                        <button class="small-btn delete-server" data-id="${s.id}">Delete</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;

        // Add event listeners for connect buttons (still using manual RCON)
        container.querySelectorAll('.connect-server').forEach(btn => {
            btn.addEventListener('click', () => {
                const ip = btn.dataset.ip;
                const port = parseInt(btn.dataset.port);
                const password = prompt('Enter RCON password for this server:');
                if (password) {
                    ConnectionManager.connect({ ip, port, password });
                }
            });
        });

        // Delete buttons (optional)
        container.querySelectorAll('.delete-server').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if (confirm('Delete this server?')) {
                    await fetch(`${this.bridgeUrl}/api/user/servers/${id}?discord_id=${this.discordId}`, { method: 'DELETE' });
                    this.loadServers();
                }
            });
        });
    }

    checkDiscordReturn() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('discord') === 'linked') {
            localStorage.setItem('discord_linked', 'true');
            // In a real implementation, we'd also get the Discord ID from the bridge
            // For now, we'll just set a dummy ID or fetch it from an endpoint
            this.discordLinked = true;
            // Optionally, call an endpoint to get the user's Discord ID
            this.fetchDiscordId();
            toast.success('Discord linked successfully!');
            window.history.replaceState({}, '', window.location.pathname);
            this.refresh();
        }
    }

    async fetchDiscordId() {
        // This would need a new endpoint like /api/user/me that returns the current user's info
        // For now, we'll skip and just rely on the linked flag.
        // In a real app, you'd store the Discord ID in localStorage after OAuth.
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
        }
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gportalConnector = new GPortalConnector();
});