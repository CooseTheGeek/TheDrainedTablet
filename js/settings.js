// settings.js – DRAINED TABLET ULTIMATE v7.0.0
// Dashboard settings: user preferences, export/import, layout customization,
// theme, notifications, security, and more.
// Includes smooth animations and responsive design.

class Settings {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.settings = this.loadSettings();
        this.layouts = this.loadLayouts();
        this.init();
    }

    loadSettings() {
        const saved = localStorage.getItem('tdl_dashboard_settings');
        return saved ? JSON.parse(saved) : {
            defaultTab: 'home',
            theme: 'default',
            sidebarPosition: 'left',
            compactMode: false,
            showAvatars: true,
            refreshRate: 5,
            notifications: true,
            soundAlerts: true,
            autoLock: 30,
            language: 'en',
            animations: true,
            reducedMotion: false
        };
    }

    loadLayouts() {
        const saved = localStorage.getItem('tdl_layouts');
        return saved ? JSON.parse(saved) : {
            current: null,
            saved: []
        };
    }

    saveSettings() {
        localStorage.setItem('tdl_dashboard_settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    saveLayouts() {
        localStorage.setItem('tdl_layouts', JSON.stringify(this.layouts));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.applySettings(); // ensure initial theme etc.
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'settings') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-settings');
        if (!tab) return;

        // Build HTML with all sections
        tab.innerHTML = `
            <div class="settings-container">
                <div class="settings-header">
                    <h2>⚙️ DASHBOARD SETTINGS</h2>
                </div>

                <div class="settings-grid">
                    <!-- Appearance Section -->
                    <div class="settings-section">
                        <h3>🎨 Appearance</h3>
                        <div class="setting-item">
                            <label>Theme:</label>
                            <select id="theme-select">
                                <option value="default" ${this.settings.theme === 'default' ? 'selected' : ''}>Rust Classic</option>
                                <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Pure Dark</option>
                                <option value="amber" ${this.settings.theme === 'amber' ? 'selected' : ''}>Amber Glow</option>
                                <option value="military" ${this.settings.theme === 'military' ? 'selected' : ''}>Military Green</option>
                                <option value="neon" ${this.settings.theme === 'neon' ? 'selected' : ''}>Cyberpunk</option>
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
                                Compact Mode (more items)
                            </label>
                        </div>
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="show-avatars" ${this.settings.showAvatars ? 'checked' : ''}>
                                Show Player Avatars
                            </label>
                        </div>
                    </div>

                    <!-- Behavior Section -->
                    <div class="settings-section">
                        <h3>⏱️ Behavior</h3>
                        <div class="setting-item">
                            <label>Refresh Rate: <span id="refresh-val">${this.settings.refreshRate}</span> seconds</label>
                            <input type="range" id="refresh-rate" min="1" max="30" value="${this.settings.refreshRate}">
                        </div>
                        <div class="setting-item">
                            <label>Default Tab:</label>
                            <select id="default-tab">
                                <option value="home" ${this.settings.defaultTab === 'home' ? 'selected' : ''}>Home</option>
                                <option value="players" ${this.settings.defaultTab === 'players' ? 'selected' : ''}>Players</option>
                                <option value="master" ${this.settings.defaultTab === 'master' ? 'selected' : ''}>Master Control</option>
                                <option value="economy" ${this.settings.defaultTab === 'economy' ? 'selected' : ''}>Economy</option>
                                <option value="livemap" ${this.settings.defaultTab === 'livemap' ? 'selected' : ''}>Live Map</option>
                            </select>
                        </div>
                    </div>

                    <!-- Notifications Section -->
                    <div class="settings-section">
                        <h3>🔔 Notifications</h3>
                        <div class="checkbox-item">
                            <label><input type="checkbox" id="enable-notifications" ${this.settings.notifications ? 'checked' : ''}> Enable Notifications</label>
                        </div>
                        <div class="checkbox-item">
                            <label><input type="checkbox" id="sound-alerts" ${this.settings.soundAlerts ? 'checked' : ''}> Sound Alerts</label>
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

                    <!-- Security Section -->
                    <div class="settings-section">
                        <h3>🔐 Security</h3>
                        <div class="setting-item">
                            <label>Auto‑Lock: <span id="lock-val">${this.settings.autoLock}</span> minutes</label>
                            <input type="range" id="auto-lock" min="1" max="120" value="${this.settings.autoLock}">
                        </div>
                        <div class="checkbox-item">
                            <label><input type="checkbox" id="remember-me" checked> Remember Me</label>
                        </div>
                        ${this.access.hasRole('master') ? `
                            <div class="checkbox-item">
                                <label><input type="checkbox" id="two-factor"> Two‑Factor Authentication</label>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Accessibility Section -->
                    <div class="settings-section">
                        <h3>♿ Accessibility</h3>
                        <div class="checkbox-item">
                            <label><input type="checkbox" id="enable-animations" ${this.settings.animations ? 'checked' : ''}> Enable Animations</label>
                        </div>
                        <div class="checkbox-item">
                            <label><input type="checkbox" id="reduced-motion" ${this.settings.reducedMotion ? 'checked' : ''}> Reduced Motion</label>
                        </div>
                        <div class="setting-item">
                            <label>Language:</label>
                            <select id="language-select">
                                <option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>English</option>
                                <option value="es" ${this.settings.language === 'es' ? 'selected' : ''}>Español</option>
                                <option value="de" ${this.settings.language === 'de' ? 'selected' : ''}>Deutsch</option>
                                <option value="fr" ${this.settings.language === 'fr' ? 'selected' : ''}>Français</option>
                                <option value="ru" ${this.settings.language === 'ru' ? 'selected' : ''}>Русский</option>
                            </select>
                        </div>
                    </div>

                    <!-- Layout Management Section (Master only) -->
                    ${this.access.hasRole('master') ? `
                    <div class="settings-section">
                        <h3>📐 Layout Management</h3>
                        <div id="layout-list" class="layout-list"></div>
                        <button id="save-layout" class="settings-btn">💾 Save Current Layout</button>
                        <button id="reset-layout" class="settings-btn">↺ Reset to Default</button>
                    </div>
                    ` : ''}

                    <!-- Data Management Section -->
                    <div class="settings-section">
                        <h3>💾 Data Management</h3>
                        <div class="button-group">
                            <button id="export-data" class="settings-btn">📤 EXPORT ALL DATA</button>
                            <button id="import-data" class="settings-btn">📥 IMPORT DATA</button>
                            <button id="clear-data" class="settings-btn warning">🗑️ CLEAR ALL DATA</button>
                        </div>
                        <div class="storage-info">
                            <h4>Storage Usage</h4>
                            <div class="storage-bar"><div class="storage-used" style="width: 35%"></div></div>
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

        if (this.access.hasRole('master')) {
            this.renderLayoutList();
        }
        this.setupRangeListeners();
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

    attachEvents() {
        document.getElementById('save-settings')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-settings')?.addEventListener('click', () => this.resetSettings());
        document.getElementById('export-data')?.addEventListener('click', () => this.exportData());
        document.getElementById('import-data')?.addEventListener('click', () => this.importData());
        document.getElementById('clear-data')?.addEventListener('click', () => this.clearData());

        if (this.access.hasRole('master')) {
            document.getElementById('save-layout')?.addEventListener('click', () => this.saveLayout());
            document.getElementById('reset-layout')?.addEventListener('click', () => this.resetLayout());
        }

        // Update settings in real time (optional, but we'll rely on save button)
    }

    saveSettings() {
        this.settings.defaultTab = document.getElementById('default-tab').value;
        this.settings.theme = document.getElementById('theme-select').value;
        this.settings.sidebarPosition = document.getElementById('sidebar-position').value;
        this.settings.compactMode = document.getElementById('compact-mode').checked;
        this.settings.showAvatars = document.getElementById('show-avatars').checked;
        this.settings.refreshRate = parseInt(document.getElementById('refresh-rate').value);
        this.settings.notifications = document.getElementById('enable-notifications').checked;
        this.settings.soundAlerts = document.getElementById('sound-alerts').checked;
        this.settings.autoLock = parseInt(document.getElementById('auto-lock').value);
        this.settings.language = document.getElementById('language-select').value;
        this.settings.animations = document.getElementById('enable-animations').checked;
        this.settings.reducedMotion = document.getElementById('reduced-motion').checked;

        this.saveSettings();
        this.tablet.showToast('Settings saved', 'success');
    }

    applySettings() {
        // Apply theme (class on body)
        document.body.className = `theme-${this.settings.theme}`;
        // Apply compact mode
        if (this.settings.compactMode) {
            document.body.classList.add('compact');
        } else {
            document.body.classList.remove('compact');
        }
        // Apply animations preference
        if (!this.settings.animations || this.settings.reducedMotion) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }
        // Apply language (if implemented)
        // Could set dir or lang attribute
        document.documentElement.lang = this.settings.language;
    }

    resetSettings() {
        if (confirm('Reset all settings to default?')) {
            this.settings = {
                defaultTab: 'home',
                theme: 'default',
                sidebarPosition: 'left',
                compactMode: false,
                showAvatars: true,
                refreshRate: 5,
                notifications: true,
                soundAlerts: true,
                autoLock: 30,
                language: 'en',
                animations: true,
                reducedMotion: false
            };
            this.saveSettings();
            // Update UI to match
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
            document.getElementById('enable-animations').checked = this.settings.animations;
            document.getElementById('reduced-motion').checked = this.settings.reducedMotion;

            this.tablet.showToast('Settings reset', 'info');
        }
    }

    exportData() {
        const data = {
            settings: this.settings,
            layouts: this.layouts,
            timestamp: new Date().toISOString()
        };
        // Add other stored data (users, etc.) if master
        if (this.access.hasRole('master')) {
            data.users = localStorage.getItem('tdl_users');
            data.audit = localStorage.getItem('tdl_audit_log');
        }
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `drained_settings_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
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
                    if (data.settings) {
                        this.settings = { ...this.settings, ...data.settings };
                        this.saveSettings();
                    }
                    if (data.layouts && this.access.hasRole('master')) {
                        this.layouts = data.layouts;
                        this.saveLayouts();
                    }
                    if (data.users && this.access.hasRole('master')) {
                        localStorage.setItem('tdl_users', data.users);
                    }
                    if (data.audit && this.access.hasRole('master')) {
                        localStorage.setItem('tdl_audit_log', data.audit);
                    }
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
        if (confirm('⚠️ DELETE ALL LOCAL DATA? This cannot be undone!')) {
            localStorage.clear();
            this.tablet.showToast('All local data cleared', 'error');
            setTimeout(() => location.reload(), 1500);
        }
    }

    // Layout management (drag‑drop customization)
    renderLayoutList() {
        const list = document.getElementById('layout-list');
        if (!list) return;
        let html = '';
        if (this.layouts.saved.length === 0) {
            html = '<p>No saved layouts</p>';
        } else {
            this.layouts.saved.forEach((layout, index) => {
                html += `
                    <div class="layout-item">
                        <span>${layout.name}</span>
                        <button class="small-btn load-layout" data-index="${index}">Load</button>
                        <button class="small-btn delete-layout" data-index="${index}">Delete</button>
                    </div>
                `;
            });
        }
        list.innerHTML = html;

        list.querySelectorAll('.load-layout').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadLayout(parseInt(e.target.dataset.index)));
        });
        list.querySelectorAll('.delete-layout').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteLayout(parseInt(e.target.dataset.index)));
        });
    }

    saveLayout() {
        const name = prompt('Enter layout name:');
        if (!name) return;
        // Capture current layout from LayoutManager
        const current = LayoutManager.loadLayout() || {};
        const layout = {
            name,
            data: current,
            created: new Date().toISOString()
        };
        this.layouts.saved.push(layout);
        this.saveLayouts();
        this.renderLayoutList();
        this.tablet.showToast('Layout saved', 'success');
    }

    loadLayout(index) {
        const layout = this.layouts.saved[index];
        if (layout && layout.data) {
            LayoutManager.saveLayout(layout.data);
            this.tablet.showToast(`Layout "${layout.name}" loaded`, 'success');
        }
    }

    deleteLayout(index) {
        if (confirm('Delete this layout?')) {
            this.layouts.saved.splice(index, 1);
            this.saveLayouts();
            this.renderLayoutList();
            this.tablet.showToast('Layout deleted', 'info');
        }
    }

    resetLayout() {
        if (confirm('Reset layout to default?')) {
            LayoutManager.resetLayout();
            this.tablet.showToast('Layout reset', 'info');
        }
    }

    refresh() {
        this.renderLayoutList();
        this.tablet.showToast('Settings refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.settings = new Settings();
});