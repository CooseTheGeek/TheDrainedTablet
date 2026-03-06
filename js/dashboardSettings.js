// DASHBOARD SETTINGS - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Stewart (CooseTheGeek). All Rights Reserved.

class DashboardSettings {
    constructor(tablet) {
        this.tablet = tablet;
        this.settings = this.loadSettings();
        this.init();
    }

    loadSettings() {
        const saved = localStorage.getItem('drained_dashboard_settings');
        return saved ? JSON.parse(saved) : {
            defaultTab: 'home',
            theme: 'amber',
            sidebarPosition: 'left',
            compactMode: false,
            showAvatars: true,
            refreshRate: 5,
            notifications: true,
            soundAlerts: true,
            autoLock: 30,
            language: 'en'
        };
    }

    saveSettings() {
        localStorage.setItem('drained_dashboard_settings', JSON.stringify(this.settings));
    }

    init() {
        this.createSettingsHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'settings') {
                this.refresh();
            }
        });
    }

    createSettingsHTML() {
        const settingsTab = document.getElementById('tab-settings');
        if (!settingsTab) return;

        settingsTab.innerHTML = `
            <div class="settings-container">
                <div class="settings-header">
                    <h2>⚙️ DASHBOARD SETTINGS</h2>
                </div>

                <div class="settings-grid">
                    <div class="settings-section">
                        <h3>🎨 APPEARANCE</h3>
                        
                        <div class="setting-item">
                            <label>Theme:</label>
                            <select id="theme-select">
                                <option value="amber" ${this.settings.theme === 'amber' ? 'selected' : ''}>Amber Classic</option>
                                <option value="rust" ${this.settings.theme === 'rust' ? 'selected' : ''}>Rust Red</option>
                                <option value="military" ${this.settings.theme === 'military' ? 'selected' : ''}>Military Green</option>
                                <option value="neon" ${this.settings.theme === 'neon' ? 'selected' : ''}>Cyberpunk</option>
                                <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Pure Dark</option>
                            </select>
                        </div>
                        
                        <div class="setting-item">
                            <label>Sidebar Position:</label>
                            <select id="sidebar-position">
                                <option value="left" ${this.settings.sidebarPosition === 'left' ? 'selected' : ''}>Left</option>
                                <option value="right" ${this.settings.sidebarPosition === 'right' ? 'selected' : ''}>Right</option>
                                <option value="top" ${this.settings.sidebarPosition === 'top' ? 'selected' : ''}>Top</option>
                            </select>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="compact-mode" ${this.settings.compactMode ? 'checked' : ''}>
                                Compact Mode (show more items)
                            </label>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="show-avatars" ${this.settings.showAvatars ? 'checked' : ''}>
                                Show Player Avatars
                            </label>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3>⏱️ PERFORMANCE</h3>
                        
                        <div class="setting-item">
                            <label>Refresh Rate: <span id="refresh-val">${this.settings.refreshRate}</span> seconds</label>
                            <input type="range" id="refresh-rate" min="1" max="30" value="${this.settings.refreshRate}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Default Tab:</label>
                            <select id="default-tab">
                                <option value="home" ${this.settings.defaultTab === 'home' ? 'selected' : ''}>Home</option>
                                <option value="livemap" ${this.settings.defaultTab === 'livemap' ? 'selected' : ''}>Live Map</option>
                                <option value="items" ${this.settings.defaultTab === 'items' ? 'selected' : ''}>Items</option>
                                <option value="kits" ${this.settings.defaultTab === 'kits' ? 'selected' : ''}>Kits</option>
                                <option value="players" ${this.settings.defaultTab === 'players' ? 'selected' : ''}>Players</option>
                            </select>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3>🔔 NOTIFICATIONS</h3>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="enable-notifications" ${this.settings.notifications ? 'checked' : ''}>
                                Enable Notifications
                            </label>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="sound-alerts" ${this.settings.soundAlerts ? 'checked' : ''}>
                                Sound Alerts
                            </label>
                        </div>
                        
                        <div class="setting-item">
                            <label>Player Join Alerts:</label>
                            <select id="join-alerts">
                                <option value="all">All Players</option>
                                <option value="friends">Friends Only</option>
                                <option value="none">None</option>
                            </select>
                        </div>
                        
                        <div class="setting-item">
                            <label>Event Alerts:</label>
                            <select id="event-alerts">
                                <option value="all">All Events</option>
                                <option value="major">Major Events Only</option>
                                <option value="none">None</option>
                            </select>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3>🔐 SECURITY</h3>
                        
                        <div class="setting-item">
                            <label>Auto-Lock: <span id="lock-val">${this.settings.autoLock}</span> minutes</label>
                            <input type="range" id="auto-lock" min="1" max="120" value="${this.settings.autoLock}">
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="remember-me" checked>
                                Remember Me
                            </label>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="two-factor">
                                Two-Factor Authentication
                            </label>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3>🌐 LANGUAGE</h3>
                        
                        <div class="setting-item">
                            <label>Display Language:</label>
                            <select id="language-select">
                                <option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>English</option>
                                <option value="es" ${this.settings.language === 'es' ? 'selected' : ''}>Español</option>
                                <option value="de" ${this.settings.language === 'de' ? 'selected' : ''}>Deutsch</option>
                                <option value="fr" ${this.settings.language === 'fr' ? 'selected' : ''}>Français</option>
                                <option value="ru" ${this.settings.language === 'ru' ? 'selected' : ''}>Русский</option>
                            </select>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3>💾 DATA</h3>
                        
                        <div class="button-group">
                            <button id="export-data" class="settings-btn">📤 EXPORT ALL DATA</button>
                            <button id="import-data" class="settings-btn">📥 IMPORT DATA</button>
                            <button id="clear-data" class="settings-btn warning">🗑️ CLEAR ALL DATA</button>
                        </div>
                        
                        <div class="storage-info">
                            <h4>Storage Usage</h4>
                            <div class="storage-bar">
                                <div class="storage-used" style="width: 35%"></div>
                            </div>
                            <div>Used: 2.4 MB / 10 MB</div>
                        </div>
                    </div>
                </div>

                <div class="settings-actions">
                    <button id="save-settings" class="settings-btn primary">💾 SAVE SETTINGS</button>
                    <button id="reset-settings" class="settings-btn">🔄 RESET TO DEFAULT</button>
                </div>
            </div>
        `;

        this.setupRangeListeners();
    }

    setupEventListeners() {
        document.getElementById('save-settings')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-settings')?.addEventListener('click', () => this.resetSettings());
        document.getElementById('export-data')?.addEventListener('click', () => this.exportData());
        document.getElementById('import-data')?.addEventListener('click', () => this.importData());
        document.getElementById('clear-data')?.addEventListener('click', () => this.clearData());

        const ranges = [
            { id: 'refresh-rate', val: 'refresh-val' },
            { id: 'auto-lock', val: 'lock-val' }
        ];

        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });
    }

    setupRangeListeners() {
        const ranges = [
            { id: 'refresh-rate', val: 'refresh-val' },
            { id: 'auto-lock', val: 'lock-val' }
        ];

        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });
    }

    saveSettings() {
        this.settings = {
            defaultTab: document.getElementById('default-tab').value,
            theme: document.getElementById('theme-select').value,
            sidebarPosition: document.getElementById('sidebar-position').value,
            compactMode: document.getElementById('compact-mode').checked,
            showAvatars: document.getElementById('show-avatars').checked,
            refreshRate: parseInt(document.getElementById('refresh-rate').value),
            notifications: document.getElementById('enable-notifications').checked,
            soundAlerts: document.getElementById('sound-alerts').checked,
            autoLock: parseInt(document.getElementById('auto-lock').value),
            language: document.getElementById('language-select').value
        };

        this.saveSettings();
        this.applySettings();
        this.tablet.showToast('Settings saved', 'success');
    }

    applySettings() {
        // Apply theme
        document.documentElement.className = `theme-${this.settings.theme}`;
        
        // Apply compact mode
        if (this.settings.compactMode) {
            document.body.classList.add('compact');
        } else {
            document.body.classList.remove('compact');
        }
        
        // Set default tab
        if (this.tablet.switchTab) {
            this.tablet.switchTab(this.settings.defaultTab);
        }
    }

    resetSettings() {
        this.tablet.showConfirm('Reset all settings to default?', (confirmed) => {
            if (confirmed) {
                this.settings = {
                    defaultTab: 'home',
                    theme: 'amber',
                    sidebarPosition: 'left',
                    compactMode: false,
                    showAvatars: true,
                    refreshRate: 5,
                    notifications: true,
                    soundAlerts: true,
                    autoLock: 30,
                    language: 'en'
                };

                // Update UI
                document.getElementById('default-tab').value = this.settings.defaultTab;
                document.getElementById('theme-select').value = this.settings.theme;
                document.getElementById('sidebar-position').value = this.settings.sidebarPosition;
                document.getElementById('compact-mode').checked = this.settings.compactMode;
                document.getElementById('show-avatars').checked = this.settings.showAvatars;
                document.getElementById('refresh-rate').value = this.settings.refreshRate;
                document.getElementById('refresh-val').innerText = this.settings.refreshRate;
                document.getElementById('enable-notifications').checked = this.settings.notifications;
                document.getElementById('sound-alerts').checked = this.settings.soundAlerts;
                document.getElementById('auto-lock').value = this.settings.autoLock;
                document.getElementById('lock-val').innerText = this.settings.autoLock;
                document.getElementById('language-select').value = this.settings.language;

                this.applySettings();
                this.tablet.showToast('Settings reset', 'info');
            }
        });
    }

    exportData() {
        const data = {
            settings: this.settings,
            backups: localStorage.getItem('drained_backups'),
            kits: localStorage.getItem('drained_kits'),
            bans: localStorage.getItem('drained_bans'),
            zones: localStorage.getItem('drained_zones'),
            players: localStorage.getItem('drained_players')
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `drained_export_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        this.tablet.showToast('Data exported', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.settings) localStorage.setItem('drained_dashboard_settings', JSON.stringify(data.settings));
                    if (data.backups) localStorage.setItem('drained_backups', data.backups);
                    if (data.kits) localStorage.setItem('drained_kits', data.kits);
                    if (data.bans) localStorage.setItem('drained_bans', data.bans);
                    if (data.zones) localStorage.setItem('drained_zones', data.zones);
                    if (data.players) localStorage.setItem('drained_players', data.players);
                    
                    this.tablet.showToast('Data imported', 'success');
                    setTimeout(() => location.reload(), 1000);
                } catch (err) {
                    this.tablet.showError('Invalid import file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    clearData() {
        this.tablet.showConfirm('⚠️ DELETE ALL DATA?\nThis cannot be undone!', (confirmed) => {
            if (confirmed) {
                localStorage.clear();
                this.tablet.showToast('All data cleared', 'error');
                setTimeout(() => location.reload(), 1500);
            }
        });
    }

    refresh() {
        this.tablet.showToast('Settings refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardSettings = new DashboardSettings(window.drainedTablet);
});