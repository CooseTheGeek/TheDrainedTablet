// audit-log.js – DRAINED TABLET ULTIMATE v7.0.0
// Admin action logging and viewer. Logs are stored in the bridge database.
// Only accessible by Master and Owner roles.

class AuditLog {
    constructor() {
        this.tablet = window.drainedTablet;
        this.db = window.database;
        this.access = window.accessControl;
        this.logs = [];
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'audit') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-audit');
        if (!tab) return;
        tab.innerHTML = `
            <div class="audit-container">
                <div class="audit-header">
                    <h2>📋 AUDIT LOG</h2>
                    <div class="audit-controls">
                        <button id="audit-refresh" class="audit-btn">🔄 REFRESH</button>
                        <button id="audit-export" class="audit-btn">📤 EXPORT</button>
                    </div>
                </div>

                <div class="audit-filters">
                    <input type="text" id="audit-user-filter" placeholder="Filter by username...">
                    <input type="text" id="audit-action-filter" placeholder="Filter by action...">
                    <input type="date" id="audit-date-from"> to <input type="date" id="audit-date-to">
                    <button id="audit-apply-filters" class="audit-btn">🔍 APPLY</button>
                </div>

                <div class="audit-table-container">
                    <table class="audit-table" id="audit-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Username</th>
                                <th>Action</th>
                                <th>IP</th>
                            </tr>
                        </thead>
                        <tbody id="audit-tbody">
                            <tr><td colspan="4" class="loading">Loading audit logs...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    attachEvents() {
        document.getElementById('audit-refresh')?.addEventListener('click', () => this.refresh());
        document.getElementById('audit-export')?.addEventListener('click', () => this.export());
        document.getElementById('audit-apply-filters')?.addEventListener('click', () => this.applyFilters());
    }

    async loadLogs() {
        if (!this.access.isMaster()) {
            document.getElementById('audit-tbody').innerHTML = '<tr><td colspan="4" class="error">Access denied</td></tr>';
            return;
        }
        try {
            this.logs = await this.db.getAuditLogs(500); // get last 500
            this.renderLogs(this.logs);
        } catch (err) {
            document.getElementById('audit-tbody').innerHTML = '<tr><td colspan="4" class="error">Failed to load logs</td></tr>';
        }
    }

    renderLogs(logs) {
        const tbody = document.getElementById('audit-tbody');
        if (!tbody) return;
        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="no-logs">No logs found</td></tr>';
            return;
        }
        let html = '';
        logs.forEach(log => {
            const time = new Date(log.timestamp).toLocaleString();
            html += `
                <tr>
                    <td>${time}</td>
                    <td>${log.username || '-'}</td>
                    <td>${log.action}</td>
                    <td>${log.ip || '-'}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }

    applyFilters() {
        const userFilter = document.getElementById('audit-user-filter').value.toLowerCase();
        const actionFilter = document.getElementById('audit-action-filter').value.toLowerCase();
        const fromDate = document.getElementById('audit-date-from').value;
        const toDate = document.getElementById('audit-date-to').value;

        let filtered = this.logs;
        if (userFilter) {
            filtered = filtered.filter(l => l.username && l.username.toLowerCase().includes(userFilter));
        }
        if (actionFilter) {
            filtered = filtered.filter(l => l.action.toLowerCase().includes(actionFilter));
        }
        if (fromDate) {
            const from = new Date(fromDate).getTime();
            filtered = filtered.filter(l => new Date(l.timestamp).getTime() >= from);
        }
        if (toDate) {
            const to = new Date(toDate).getTime() + 86400000; // end of day
            filtered = filtered.filter(l => new Date(l.timestamp).getTime() <= to);
        }
        this.renderLogs(filtered);
    }

    export() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_log_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        this.tablet.showToast('Audit log exported', 'success');
    }

    refresh() {
        this.loadLogs();
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.auditLog = new AuditLog();
});