// gportal-connector.js – DRAINED TABLET ULTIMATE v7.0.0
// Handles GPortal quick‑connect codes and automatic server detection.

class GPortalConnector {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.bridgeUrl = AppState.connection.bridgeUrl;
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
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
                    <div class="gportal-section">
                        <h3>QUICK CONNECT (Access Code)</h3>
                        <p class="info">Enter your 6‑digit GPortal access code to connect instantly.</p>
                        <div class="form-group">
                            <input type="text" id="gportal-code" placeholder="e.g., F7K2M9" maxlength="6">
                            <button id="gportal-connect-code" class="gportal-btn primary">CONNECT</button>
                        </div>
                        <p class="hint">Your code is generated from your server ID + RCON port + security token.</p>
                    </div>

                    <div class="gportal-section">
                        <h3>MANUAL CONNECTION</h3>
                        <div class="form-group">
                            <label>Server IP:</label>
                            <input type="text" id="gportal-ip" placeholder="123.45.67.89">
                        </div>
                        <div class="form-group">
                            <label>RCON Port:</label>
                            <input type="number" id="gportal-port" value="28916">
                        </div>
                        <div class="form-group">
                            <label>RCON Password:</label>
                            <input type="password" id="gportal-password">
                        </div>
                        <button id="gportal-connect-manual" class="gportal-btn">CONNECT</button>
                    </div>

                    <div class="gportal-section">
                        <h3>SAVED SERVERS</h3>
                        <div id="gportal-saved-list"></div>
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
        document.getElementById('gportal-connect-code')?.addEventListener('click', () => this.connectWithCode());
        document.getElementById('gportal-connect-manual')?.addEventListener('click', () => this.connectManual());
    }

    async connectWithCode() {
        const code = document.getElementById('gportal-code').value.trim();
        if (!code || code.length !== 6) {
            this.tablet.showError('Enter a valid 6‑digit code');
            return;
        }

        this.tablet.showToast('Resolving code...', 'info');
        try {
            const res = await fetch(`${this.bridgeUrl}/api/gportal/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            if (!res.ok) throw new Error('Code invalid or expired');
            const { ip, port, password } = await res.json();

            // Connect using resolved credentials
            const success = await ConnectionManager.connect({ ip, port, password });
            if (success) {
                this.logConnection(`Connected via code ${code} to ${ip}:${port}`);
                document.getElementById('gportal-status').innerHTML = '🟢 Connected';
            } else {
                this.logConnection(`Failed to connect via code ${code}`);
            }
        } catch (err) {
            this.tablet.showError(err.message);
            this.logConnection(`Error: ${err.message}`);
        }
    }

    async connectManual() {
        const ip = document.getElementById('gportal-ip').value.trim();
        const port = parseInt(document.getElementById('gportal-port').value);
        const password = document.getElementById('gportal-password').value;

        if (!ip || !port || !password) {
            this.tablet.showError('All fields required');
            return;
        }

        const success = await ConnectionManager.connect({ ip, port, password });
        if (success) {
            this.logConnection(`Manual connect to ${ip}:${port}`);
            document.getElementById('gportal-status').innerHTML = '🟢 Connected';
        } else {
            this.logConnection(`Manual connect to ${ip}:${port} failed`);
        }
    }

    logConnection(message) {
        const list = document.getElementById('gportal-log-list');
        if (!list) return;
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        list.prepend(entry);
        if (list.children.length > 20) list.removeChild(list.lastChild);
    }

    refresh() {
        // Refresh saved servers list (could be loaded from localStorage)
        // For now, just a placeholder
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gportalConnector = new GPortalConnector();
});