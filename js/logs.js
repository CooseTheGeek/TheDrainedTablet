// logs.js – DRAINED TABLET ULTIMATE v7.0.0
// Server log viewer with filtering and export.
// Fetches logs from the server via RCON or bridge.

class Logs {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.logs = [];
        this.filtered = [];
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'logs') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-logs');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="logs-container">
                <div class="logs-header">
                    <h2>📜 SERVER LOGS</h2>
                    <button id="logs-refresh" class="logs-btn">🔄 REFRESH</button>
                    <button id="logs-export" class="logs-btn">📤 EXPORT</button>
                </div>
                <div class="logs-filters">
                    <input type="text" id="logs-search" placeholder="Search logs...">
                    <select id="logs-level">
                        <option value="all">All Levels</option>
                        <option value="info">Info</option>
                        <option value="warn">Warning</option>
                        <option value="error">Error</option>
                        <option value="chat">Chat</option>
                    </select>
                    <input type="date" id="logs-date"> to <input type="date" id="logs-date-end">
                    <button id="logs-apply" class="logs-btn">Apply Filters</button>
                </div>
                <div class="logs-list" id="logs-list">
                    <div class="loading">Loading logs...</div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        document.getElementById('logs-refresh')?.addEventListener('click', () => this.refresh());
        document.getElementById('logs-export')?.addEventListener('click', () => this.export());
        document.getElementById('logs-apply')?.addEventListener('click', () => this.applyFilters());
    }

    async loadLogs() {
        if (AppState.connection.status !== 'connected') {
            document.getElementById('logs-list').innerHTML = '<div class="waiting">Waiting for connection...</div>';
            return;
        }
        try {
            // Fetch logs via RCON (may need a specific command)
            const result = await ConnectionManager.executeCommand('logs.recent 1000'); // hypothetical command
            this.logs = this.parseLogs(result);
            this.filtered = this.logs;
            this.renderLogs();
        } catch (err) {
            // Fallback: use bridge if available
            try {
                const response = await fetch(`${AppState.connection.bridgeUrl}/api/logs`);
                const data = await response.json();
                this.logs = data;
                this.filtered = this.logs;
                this.renderLogs();
            } catch (fallbackErr) {
                document.getElementById('logs-list').innerHTML = `<div class="error">${err.message}</div>`;
            }
        }
    }

    parseLogs(raw) {
        // Simple parser – each line could be a log entry
        if (!raw) return [];
        return raw.split('\n').map(line => ({
            timestamp: Date.now(), // placeholder
            level: 'info',
            message: line,
            raw: line
        }));
    }

    renderLogs() {
        const listDiv = document.getElementById('logs-list');
        if (!listDiv) return;
        if (this.filtered.length === 0) {
            listDiv.innerHTML = '<div class="no-logs">No logs found</div>';
            return;
        }
        let html = '';
        this.filtered.slice(0, 500).forEach(log => {
            const time = log.timestamp ? new Date(log.timestamp).toLocaleString() : '';
            html += `<div class="log-line ${log.level}">[${time}] ${log.message}</div>`;
        });
        listDiv.innerHTML = html;
    }

    applyFilters() {
        const search = document.getElementById('logs-search').value.toLowerCase();
        const level = document.getElementById('logs-level').value;
        const from = document.getElementById('logs-date').value;
        const to = document.getElementById('logs-date-end').value;

        this.filtered = this.logs.filter(log => {
            if (level !== 'all' && log.level !== level) return false;
            if (search && !log.message.toLowerCase().includes(search)) return false;
            if (from) {
                const logDate = new Date(log.timestamp).toISOString().slice(0,10);
                if (logDate < from) return false;
            }
            if (to) {
                const logDate = new Date(log.timestamp).toISOString().slice(0,10);
                if (logDate > to) return false;
            }
            return true;
        });
        this.renderLogs();
    }

    export() {
        const dataStr = JSON.stringify(this.filtered, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
    }

    refresh() {
        this.loadLogs();
        this.tablet.showToast('Logs refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.logs = new Logs();
});