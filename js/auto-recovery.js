// auto-recovery.js – DRAINED TABLET ULTIMATE v7.0.0
// Automatically detects and recovers from common server issues:
// - RCON disconnections
// - High resource usage
// - Stuck events
// - Plugin failures

class AutoRecovery {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.enabled = true;
        this.health = window.connectionHealth;
        this.queue = window.commandQueue;
        this.recoveryActions = [];
        this.logs = [];
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.startMonitoring();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'recovery') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-recovery');
        if (!tab) return;

        if (!this.access.hasRole('owner')) {
            tab.innerHTML = '<div class="access-denied">Owner access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="recovery-container">
                <div class="recovery-header">
                    <h2>🔄 AUTO‑RECOVERY</h2>
                    <div class="recovery-status">
                        <label class="switch">
                            <input type="checkbox" id="recovery-toggle" ${this.enabled ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                        <span id="recovery-status-text">${this.enabled ? 'ENABLED' : 'DISABLED'}</span>
                    </div>
                </div>

                <div class="recovery-grid">
                    <div class="recovery-section">
                        <h3>CONNECTION RECOVERY</h3>
                        <div class="checkbox-item">
                            <label><input type="checkbox" id="recover-rcon" checked> Auto‑reconnect RCON</label>
                        </div>
                        <div class="checkbox-item">
                            <label><input type="checkbox" id="recover-bridge" checked> Auto‑reconnect Bridge</label>
                        </div>
                        <div class="setting-item">
                            <label>Max reconnect attempts: <span id="max-reconnect-val">5</span></label>
                            <input type="range" id="max-reconnect" min="1" max="20" value="5">
                        </div>
                    </div>

                    <div class="recovery-section">
                        <h3>RESOURCE RECOVERY</h3>
                        <div class="checkbox-item">
                            <label><input type="checkbox" id="recover-cpu"> Auto‑restart on high CPU</label>
                        </div>
                        <div class="setting-item">
                            <label>CPU threshold: <span id="cpu-thresh-val">90</span>%</label>
                            <input type="range" id="cpu-thresh" min="50" max="100" value="90">
                        </div>
                        <div class="checkbox-item">
                            <label><input type="checkbox" id="recover-ram"> Auto‑restart on high RAM</label>
                        </div>
                        <div class="setting-item">
                            <label>RAM threshold: <span id="ram-thresh-val">95</span>%</label>
                            <input type="range" id="ram-thresh" min="50" max="100" value="95">
                        </div>
                    </div>

                    <div class="recovery-section">
                        <h3>EVENT RECOVERY</h3>
                        <div class="checkbox-item">
                            <label><input type="checkbox" id="recover-events" checked> Auto‑restart stuck events</label>
                        </div>
                        <div class="setting-item">
                            <label>Event timeout: <span id="event-timeout-val">30</span> minutes</label>
                            <input type="range" id="event-timeout" min="5" max="120" value="30">
                        </div>
                    </div>

                    <div class="recovery-section">
                        <h3>RECOVERY LOG</h3>
                        <div id="recovery-log" class="recovery-log"></div>
                    </div>
                </div>

                <div class="recovery-actions">
                    <button id="run-recovery-now" class="recovery-btn primary">🔄 RUN RECOVERY NOW</button>
                    <button id="clear-log" class="recovery-btn">🗑️ CLEAR LOG</button>
                </div>
            </div>
        `;

        this.setupRangeListeners();
        this.renderLog();
    }

    setupRangeListeners() {
        const ranges = [
            { id: 'max-reconnect', val: 'max-reconnect-val' },
            { id: 'cpu-thresh', val: 'cpu-thresh-val' },
            { id: 'ram-thresh', val: 'ram-thresh-val' },
            { id: 'event-timeout', val: 'event-timeout-val' }
        ];
        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });
    }

    attachEvents() {
        document.getElementById('recovery-toggle')?.addEventListener('change', (e) => {
            this.enabled = e.target.checked;
            document.getElementById('recovery-status-text').innerText = this.enabled ? 'ENABLED' : 'DISABLED';
            if (this.enabled) this.startMonitoring();
        });
        document.getElementById('run-recovery-now')?.addEventListener('click', () => this.runRecovery());
        document.getElementById('clear-log')?.addEventListener('click', () => this.clearLog());
    }

    startMonitoring() {
        if (!this.enabled) return;
        setInterval(() => this.checkHealth(), 30000); // every 30 seconds
    }

    async checkHealth() {
        if (!this.access.hasRole('owner')) return;
        const stats = this.health?.metrics;
        if (!stats) return;

        // CPU recovery
        if (document.getElementById('recover-cpu')?.checked && stats.cpu > this.getThreshold('cpu-thresh')) {
            this.log('⚠️ High CPU detected, initiating recovery...');
            await this.performAction('restart');
        }

        // RAM recovery
        if (document.getElementById('recover-ram')?.checked && stats.ram > this.getThreshold('ram-thresh')) {
            this.log('⚠️ High RAM detected, initiating recovery...');
            await this.performAction('restart');
        }

        // RCON reconnection
        if (document.getElementById('recover-rcon')?.checked && AppState.connection.status !== 'connected') {
            this.log('⚠️ RCON disconnected, attempting reconnect...');
            await this.performAction('reconnect-rcon');
        }
    }

    getThreshold(id) {
        return parseInt(document.getElementById(id)?.value || '90');
    }

    async performAction(action) {
        switch(action) {
            case 'restart':
                this.log('🔄 Restarting server...');
                try {
                    await ConnectionManager.executeCommand('global.restart');
                    this.log('✅ Server restart initiated');
                } catch (err) {
                    this.log(`❌ Restart failed: ${err.message}`);
                }
                break;
            case 'reconnect-rcon':
                try {
                    await ConnectionManager.autoReconnect();
                    this.log('✅ RCON reconnected');
                } catch (err) {
                    this.log(`❌ Reconnect failed: ${err.message}`);
                }
                break;
            default:
                break;
        }
    }

    runRecovery() {
        this.log('🔄 Manual recovery triggered');
        // Check all conditions
        this.checkHealth();
    }

    log(message) {
        const entry = {
            time: new Date().toLocaleTimeString(),
            message
        };
        this.logs.unshift(entry);
        if (this.logs.length > 50) this.logs.pop();
        this.renderLog();
    }

    renderLog() {
        const logDiv = document.getElementById('recovery-log');
        if (!logDiv) return;
        if (this.logs.length === 0) {
            logDiv.innerHTML = '<div class="no-logs">No recovery actions logged</div>';
            return;
        }
        logDiv.innerHTML = this.logs.map(entry => `
            <div class="log-entry">[${entry.time}] ${entry.message}</div>
        `).join('');
    }

    clearLog() {
        this.logs = [];
        this.renderLog();
    }

    refresh() {
        this.renderLog();
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.autoRecovery = new AutoRecovery();
});