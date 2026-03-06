// BACKUP SYSTEM - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class BackupSystem {
    constructor(tablet) {
        this.tablet = tablet;
        this.backups = this.loadBackups();
        this.settings = this.loadSettings();
        this.init();
    }

    loadBackups() {
        const saved = localStorage.getItem('drained_backups');
        return saved ? JSON.parse(saved) : [];
    }

    loadSettings() {
        const saved = localStorage.getItem('drained_backup_settings');
        return saved ? JSON.parse(saved) : {
            autoBackup: true,
            interval: 24, // hours
            keepLast: 30,
            compress: true,
            notifyOnComplete: true
        };
    }

    saveBackups() {
        localStorage.setItem('drained_backups', JSON.stringify(this.backups));
    }

    saveSettings() {
        localStorage.setItem('drained_backup_settings', JSON.stringify(this.settings));
    }

    init() {
        this.createBackupHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'backup') {
                this.refresh();
            }
        });
    }

    createBackupHTML() {
        const backupTab = document.getElementById('tab-backup');
        if (!backupTab) return;

        backupTab.innerHTML = `
            <div class="backup-container">
                <div class="backup-header">
                    <h2>💾 BACKUP & RESTORE</h2>
                </div>

                <div class="backup-grid">
                    <div class="backup-section">
                        <h3>CREATE BACKUP</h3>
                        
                        <div class="form-group">
                            <label>Backup Name:</label>
                            <input type="text" id="backup-name" placeholder="e.g., Pre-wipe backup">
                        </div>
                        
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="backup-kits" checked> Kits
                            </label>
                            <label>
                                <input type="checkbox" id="backup-bans" checked> Bans
                            </label>
                            <label>
                                <input type="checkbox" id="backup-settings" checked> Server Settings
                            </label>
                            <label>
                                <input type="checkbox" id="backup-zones" checked> Zones
                            </label>
                            <label>
                                <input type="checkbox" id="backup-players" checked> Player Data
                            </label>
                        </div>
                        
                        <button id="create-backup" class="backup-btn primary">📦 CREATE BACKUP</button>
                    </div>

                    <div class="backup-section">
                        <h3>AUTOMATIC BACKUPS</h3>
                        
                        <div class="setting-item">
                            <label>
                                <input type="checkbox" id="auto-backup" ${this.settings.autoBackup ? 'checked' : ''}>
                                Enable Auto Backup
                            </label>
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
                            <label>
                                <input type="checkbox" id="compress-backup" ${this.settings.compress ? 'checked' : ''}>
                                Compress Backups
                            </label>
                            <label>
                                <input type="checkbox" id="notify-backup" ${this.settings.notifyOnComplete ? 'checked' : ''}>
                                Notify on Complete
                            </label>
                        </div>
                        
                        <button id="save-settings" class="backup-btn">💾 SAVE SETTINGS</button>
                    </div>

                    <div class="backup-section full-width">
                        <h3>BACKUP HISTORY</h3>
                        
                        <div id="backup-list" class="backup-list"></div>
                        
                        <div class="backup-actions">
                            <button id="clear-backups" class="backup-btn warning">🗑️ CLEAR ALL</button>
                            <button id="export-backups" class="backup-btn">📤 EXPORT</button>
                            <button id="import-backup" class="backup-btn">📥 IMPORT</button>
                        </div>
                    </div>
                </div>

                <div class="restore-panel">
                    <h3>⚠️ RESTORE</h3>
                    <p class="warning-text">Restoring will overwrite current data. This action cannot be undone.</p>
                    <div class="restore-controls">
                        <select id="restore-select"></select>
                        <button id="restore-backup" class="backup-btn danger">🔄 RESTORE SELECTED</button>
                    </div>
                </div>
            </div>
        `;

        this.renderBackupList();
        this.setupRangeListeners();
    }

    setupEventListeners() {
        document.getElementById('create-backup')?.addEventListener('click', () => this.createBackup());
        document.getElementById('save-settings')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('clear-backups')?.addEventListener('click', () => this.clearBackups());
        document.getElementById('export-backups')?.addEventListener('click', () => this.exportBackups());
        document.getElementById('import-backup')?.addEventListener('click', () => this.importBackup());
        document.getElementById('restore-backup')?.addEventListener('click', () => this.restoreBackup());

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

    createBackup() {
        const name = document.getElementById('backup-name').value || `Backup_${new Date().toLocaleString()}`;
        
        const options = {
            kits: document.getElementById('backup-kits').checked,
            bans: document.getElementById('backup-bans').checked,
            settings: document.getElementById('backup-settings').checked,
            zones: document.getElementById('backup-zones').checked,
            players: document.getElementById('backup-players').checked
        };

        const backup = {
            id: 'backup_' + Date.now(),
            name: name,
            date: new Date().toISOString(),
            size: Math.floor(Math.random() * 10 + 1) + 'MB',
            options: options,
            data: this.gatherData(options)
        };

        this.backups.unshift(backup);
        this.saveBackups();
        this.renderBackupList();
        this.tablet.showToast(`Backup "${name}" created`, 'success');
    }

    gatherData(options) {
        const data = {};
        if (options.kits) data.kits = localStorage.getItem('drained_kits');
        if (options.bans) data.bans = localStorage.getItem('drained_bans');
        if (options.settings) data.settings = localStorage.getItem('drained_settings');
        if (options.zones) data.zones = localStorage.getItem('drained_zones');
        if (options.players) data.players = localStorage.getItem('drained_players');
        return data;
    }

    renderBackupList() {
        const list = document.getElementById('backup-list');
        const select = document.getElementById('restore-select');

        if (this.backups.length === 0) {
            list.innerHTML = '<div class="no-backups">No backups found</div>';
            select.innerHTML = '<option value="">No backups available</option>';
            return;
        }

        let listHtml = '';
        let selectHtml = '';

        this.backups.forEach((backup, index) => {
            const date = new Date(backup.date).toLocaleString();
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

        list.innerHTML = listHtml;
        select.innerHTML = selectHtml;

        list.querySelectorAll('.download-backup').forEach(btn => {
            btn.addEventListener('click', () => this.downloadBackup(parseInt(btn.dataset.index)));
        });

        list.querySelectorAll('.delete-backup').forEach(btn => {
            btn.addEventListener('click', () => this.deleteBackup(parseInt(btn.dataset.index)));
        });
    }

    downloadBackup(index) {
        const backup = this.backups[index];
        if (!backup) return;

        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${backup.name.replace(/\s+/g, '_')}.json`;
        a.click();
        this.tablet.showToast(`Downloaded ${backup.name}`, 'success');
    }

    deleteBackup(index) {
        this.tablet.showConfirm('Delete this backup?', (confirmed) => {
            if (confirmed) {
                this.backups.splice(index, 1);
                this.saveBackups();
                this.renderBackupList();
                this.tablet.showToast('Backup deleted', 'info');
            }
        });
    }

    restoreBackup() {
        const select = document.getElementById('restore-select');
        const index = parseInt(select.value);

        if (isNaN(index)) {
            this.tablet.showError('Select a backup to restore');
            return;
        }

        this.tablet.showConfirm('⚠️ RESTORE THIS BACKUP?\nCurrent data will be overwritten!', (confirmed) => {
            if (confirmed) {
                const backup = this.backups[index];
                if (backup.data.kits) localStorage.setItem('drained_kits', backup.data.kits);
                if (backup.data.bans) localStorage.setItem('drained_bans', backup.data.bans);
                if (backup.data.settings) localStorage.setItem('drained_settings', backup.data.settings);
                if (backup.data.zones) localStorage.setItem('drained_zones', backup.data.zones);
                if (backup.data.players) localStorage.setItem('drained_players', backup.data.players);
                
                this.tablet.showToast(`Restored "${backup.name}"`, 'success');
            }
        });
    }

    clearBackups() {
        this.tablet.showConfirm('Delete ALL backups?', (confirmed) => {
            if (confirmed) {
                this.backups = [];
                this.saveBackups();
                this.renderBackupList();
                this.tablet.showToast('All backups cleared', 'info');
            }
        });
    }

    exportBackups() {
        const json = JSON.stringify(this.backups, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all_backups_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
    }

    importBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const backups = JSON.parse(event.target.result);
                    if (Array.isArray(backups)) {
                        this.backups = [...backups, ...this.backups];
                        this.saveBackups();
                        this.renderBackupList();
                        this.tablet.showToast(`Imported ${backups.length} backups`, 'success');
                    }
                } catch (err) {
                    this.tablet.showError('Invalid backup file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    saveSettings() {
        this.settings = {
            autoBackup: document.getElementById('auto-backup').checked,
            interval: parseInt(document.getElementById('backup-interval').value),
            keepLast: parseInt(document.getElementById('keep-last').value),
            compress: document.getElementById('compress-backup').checked,
            notifyOnComplete: document.getElementById('notify-backup').checked
        };

        this.saveSettings();
        this.tablet.showToast('Backup settings saved', 'success');
    }

    refresh() {
        this.renderBackupList();
        this.tablet.showToast('Backup system refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.backupSystem = new BackupSystem(window.drainedTablet);
});