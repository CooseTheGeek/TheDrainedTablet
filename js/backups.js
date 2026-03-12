// backups.js – DRAINED TABLET ULTIMATE v7.0.0
// Complete backup and restore system using GPortal API (via bridge).
// Includes auto‑backup scheduling, settings, and full UI.

class Backups {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.backups = [];
        this.settings = {
            autoBackup: true,
            interval: 24,
            keepLast: 30,
            compress: true,
            notifyOnComplete: true
        };
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'backups') {
                this.refresh();
            }
        });
    }

    async loadSettings() {
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/backup-settings`);
            if (res.ok) {
                const data = await res.json();
                this.settings = { ...this.settings, ...data };
            }
        } catch (err) {
            console.warn('Could not load backup settings from bridge, using defaults');
        }
    }

    async saveSettings() {
        try {
            await fetch(`${AppState.connection.bridgeUrl}/api/backup-settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.settings)
            });
        } catch (err) {
            console.warn('Failed to save backup settings');
        }
    }

    createHTML() {
        const tab = document.getElementById('tab-backups');
        if (!tab) return;

        if (!this.access.hasRole('owner')) {
            tab.innerHTML = '<div class="access-denied">Owner access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="backups-container">
                <div class="backups-header">
                    <h2>💾 BACKUP & RESTORE</h2>
                    <button id="backups-refresh" class="backups-btn">🔄 REFRESH</button>
                </div>

                <div class="backups-grid">
                    <div class="backup-section">
                        <h3>CREATE BACKUP</h3>
                        <div class="form-group">
                            <label>Backup Name:</label>
                            <input type="text" id="backup-name" placeholder="e.g., Pre-wipe backup">
                        </div>
                        <div class="checkbox-group">
                            <label><input type="checkbox" id="backup-kits" checked> Kits</label>
                            <label><input type="checkbox" id="backup-bans" checked> Bans</label>
                            <label><input type="checkbox" id="backup-settings" checked> Server Settings</label>
                            <label><input type="checkbox" id="backup-zones" checked> Zones</label>
                            <label><input type="checkbox" id="backup-players" checked> Player Data</label>
                        </div>
                        <button id="create-backup" class="backups-btn primary">📦 CREATE BACKUP</button>
                    </div>

                    <div class="backup-section">
                        <h3>AUTOMATIC BACKUPS</h3>
                        <div class="setting-item">
                            <label><input type="checkbox" id="auto-backup" ${this.settings.autoBackup ? 'checked' : ''}> Enable Auto Backup</label>
                        </div>
                        <div class="setting-item">
                            <label>Interval: <span id="interval-val">${this.settings.interval}</span> hours</label>
                            <input type="range" id="backup-interval" min="1" max="168" value="${this.settings.interval}">
                        </div>
                        <div class="setting-item">
                            <label>Keep Last: <span id="keep-val">${this.settings.keepLast}</span> backups</label>
                            <input type="range" id="keep-last" min="5" max="100" value="${this.settings.keepLast}">
                        </div>
                        <div class="checkbox-group">
                            <label><input type="checkbox" id="compress-backup" ${this.settings.compress ? 'checked' : ''}> Compress Backups</label>
                            <label><input type="checkbox" id="notify-backup" ${this.settings.notifyOnComplete ? 'checked' : ''}> Notify on Complete</label>
                        </div>
                        <button id="save-settings" class="backups-btn">💾 SAVE SETTINGS</button>
                    </div>

                    <div class="backup-section full-width">
                        <h3>BACKUP HISTORY</h3>
                        <div id="backup-list" class="backup-list"></div>
                        <div class="backup-actions">
                            <button id="clear-backups" class="backups-btn warning">🗑️ CLEAR ALL</button>
                            <button id="export-backups" class="backups-btn">📤 EXPORT</button>
                            <button id="import-backup" class="backups-btn">📥 IMPORT</button>
                        </div>
                    </div>
                </div>

                <div class="restore-panel">
                    <h3>⚠️ RESTORE</h3>
                    <p class="warning-text">Restoring will overwrite current data. This action cannot be undone.</p>
                    <div class="restore-controls">
                        <select id="restore-select"></select>
                        <button id="restore-backup" class="backups-btn danger">🔄 RESTORE SELECTED</button>
                    </div>
                </div>
            </div>
        `;

        this.setupRangeListeners();
    }

    setupRangeListeners() {
        const ranges = [
            { id: 'backup-interval', val: 'interval-val' },
            { id: 'keep-last', val: 'keep-val' }
        ];
        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });
    }

    attachEvents() {
        document.getElementById('backups-refresh')?.addEventListener('click', () => this.refresh());
        document.getElementById('create-backup')?.addEventListener('click', () => this.createBackup());
        document.getElementById('save-settings')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('clear-backups')?.addEventListener('click', () => this.clearBackups());
        document.getElementById('export-backups')?.addEventListener('click', () => this.exportBackups());
        document.getElementById('import-backup')?.addEventListener('click', () => this.importBackup());
        document.getElementById('restore-backup')?.addEventListener('click', () => this.restoreBackup());

        // Update settings from UI
        document.getElementById('auto-backup')?.addEventListener('change', (e) => {
            this.settings.autoBackup = e.target.checked;
        });
        document.getElementById('compress-backup')?.addEventListener('change', (e) => {
            this.settings.compress = e.target.checked;
        });
        document.getElementById('notify-backup')?.addEventListener('change', (e) => {
            this.settings.notifyOnComplete = e.target.checked;
        });
        document.getElementById('backup-interval')?.addEventListener('input', (e) => {
            this.settings.interval = parseInt(e.target.value);
        });
        document.getElementById('keep-last')?.addEventListener('input', (e) => {
            this.settings.keepLast = parseInt(e.target.value);
        });
    }

    async loadBackups() {
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/backups`);
            if (!res.ok) throw new Error('Failed to fetch backups');
            this.backups = await res.json();
            this.renderBackupList();
        } catch (err) {
            document.getElementById('backup-list').innerHTML = `<div class="error">${err.message}</div>`;
        }
    }

    renderBackupList() {
        const listDiv = document.getElementById('backup-list');
        const restoreSelect = document.getElementById('restore-select');
        if (!listDiv) return;

        if (this.backups.length === 0) {
            listDiv.innerHTML = '<div class="no-backups">No backups found</div>';
            restoreSelect.innerHTML = '<option value="">No backups available</option>';
            return;
        }

        let listHtml = '';
        let selectHtml = '';
        this.backups.forEach((backup, index) => {
            const date = new Date(backup.created).toLocaleString();
            listHtml += `
                <div class="backup-item">
                    <div class="backup-info">
                        <span class="backup-name">${backup.name}</span>
                        <span class="backup-date">${date}</span>
                        <span class="backup-size">${backup.size}</span>
                    </div>
                    <div class="backup-actions">
                        <button class="small-btn download-backup" data-index="${index}">📥</button>
                        <button class="small-btn delete-backup" data-index="${index}">🗑️</button>
                    </div>
                </div>
            `;
            selectHtml += `<option value="${index}">${backup.name} (${date})</option>`;
        });

        listDiv.innerHTML = listHtml;
        restoreSelect.innerHTML = selectHtml;

        listDiv.querySelectorAll('.download-backup').forEach(btn => {
            btn.addEventListener('click', () => this.downloadBackup(parseInt(btn.dataset.index)));
        });
        listDiv.querySelectorAll('.delete-backup').forEach(btn => {
            btn.addEventListener('click', () => this.deleteBackup(parseInt(btn.dataset.index)));
        });
    }

    async createBackup() {
        const name = document.getElementById('backup-name').value || `Backup_${new Date().toLocaleString()}`;
        const options = {
            kits: document.getElementById('backup-kits').checked,
            bans: document.getElementById('backup-bans').checked,
            settings: document.getElementById('backup-settings').checked,
            zones: document.getElementById('backup-zones').checked,
            players: document.getElementById('backup-players').checked
        };

        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/backups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, options })
            });
            if (!res.ok) throw new Error('Create failed');
            this.tablet.showToast(`Backup "${name}" created`, 'success');
            this.loadBackups();
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    async restoreBackup() {
        const select = document.getElementById('restore-select');
        const index = parseInt(select.value);
        if (isNaN(index)) {
            this.tablet.showError('Select a backup to restore');
            return;
        }
        const backup = this.backups[index];
        if (!backup) return;
        if (!confirm('⚠️ RESTORE THIS BACKUP? Current data will be overwritten!')) return;
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/backups/${backup.id}/restore`, {
                method: 'POST'
            });
            if (!res.ok) throw new Error('Restore failed');
            this.tablet.showToast(`Restored "${backup.name}"`, 'success');
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    async deleteBackup(index) {
        const backup = this.backups[index];
        if (!backup) return;
        if (!confirm('Delete this backup?')) return;
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/backups/${backup.id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Delete failed');
            this.tablet.showToast('Backup deleted', 'info');
            this.loadBackups();
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    downloadBackup(index) {
        const backup = this.backups[index];
        if (!backup) return;
        // Trigger download via bridge
        window.open(`${AppState.connection.bridgeUrl}/api/backups/${backup.id}/download`, '_blank');
    }

    async clearBackups() {
        if (!confirm('Delete ALL backups?')) return;
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/backups`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Clear failed');
            this.tablet.showToast('All backups cleared', 'info');
            this.loadBackups();
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    exportBackups() {
        // Export as JSON
        const dataStr = JSON.stringify(this.backups, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backups_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
    }

    importBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const backups = JSON.parse(event.target.result);
                    if (!Array.isArray(backups)) throw new Error('Invalid format');
                    // Send to bridge to import
                    const res = await fetch(`${AppState.connection.bridgeUrl}/api/backups/import`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(backups)
                    });
                    if (!res.ok) throw new Error('Import failed');
                    this.tablet.showToast('Backups imported', 'success');
                    this.loadBackups();
                } catch (err) {
                    this.tablet.showError('Invalid backup file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    async saveSettings() {
        // Settings already updated via listeners
        await this.saveSettings();
        this.tablet.showToast('Backup settings saved', 'success');
    }

    refresh() {
        this.loadBackups();
        this.tablet.showToast('Backup system refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.backups = new Backups();
});