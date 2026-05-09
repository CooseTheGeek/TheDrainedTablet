// settings.js – DRAINED TABLET ULTIMATE v7.0.0
// Dashboard settings: modern card layout, with extra customization options.

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
        if (saved) return JSON.parse(saved);
        return {
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
            reducedMotion: false,
            liveBackground: true,
            fontSize: 'medium',      // new: small, medium, large
            glassBlur: 16,           // new: px
            borderRadius: 12,        // new: px
            customBackground: null   // new: dataURL
        };
    }

    loadLayouts() {
        const saved = localStorage.getItem('tdl_layouts');
        return saved ? JSON.parse(saved) : { current: null, saved: [] };
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
        this.applySettings();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'settings') this.refresh();
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-settings');
        if (!tab) return;

        tab.innerHTML = `
            <div class="settings-modern">
                <div class="settings-header">
                    <h2>⚙️ Dashboard Settings</h2>
                    <p>Customize your experience</p>
                </div>

                <div class="settings-cards">
                    <!-- Appearance Card -->
                    <div class="settings-card">
                        <div class="card-header">🎨 Appearance</div>
                        <div class="card-body">
                            <div class="setting-row">
                                <label>Theme</label>
                                <select id="theme-select">
                                    <option value="default" ${this.settings.theme === 'default' ? 'selected' : ''}>Rust Classic</option>
                                    <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Pure Dark</option>
                                    <option value="amber" ${this.settings.theme === 'amber' ? 'selected' : ''}>Amber Glow</option>
                                    <option value="military" ${this.settings.theme === 'military' ? 'selected' : ''}>Military Green</option>
                                    <option value="neon" ${this.settings.theme === 'neon' ? 'selected' : ''}>Cyberpunk</option>
                                </select>
                            </div>
                            <div class="setting-row">
                                <label>Sidebar Position</label>
                                <select id="sidebar-position">
                                    <option value="left" ${this.settings.sidebarPosition === 'left' ? 'selected' : ''}>Left</option>
                                    <option value="right" ${this.settings.sidebarPosition === 'right' ? 'selected' : ''}>Right</option>
                                    <option value="top" ${this.settings.sidebarPosition === 'top' ? 'selected' : ''}>Top</option>
                                </select>
                            </div>
                            <div class="setting-row">
                                <label>Font Size</label>
                                <select id="font-size">
                                    <option value="small" ${this.settings.fontSize === 'small' ? 'selected' : ''}>Small</option>
                                    <option value="medium" ${this.settings.fontSize === 'medium' ? 'selected' : ''}>Medium</option>
                                    <option value="large" ${this.settings.fontSize === 'large' ? 'selected' : ''}>Large</option>
                                </select>
                            </div>
                            <div class="setting-row">
                                <label>Glass Blur (px)</label>
                                <input type="range" id="glass-blur" min="0" max="32" step="1" value="${this.settings.glassBlur}">
                                <span id="glass-blur-val">${this.settings.glassBlur}</span>
                            </div>
                            <div class="setting-row">
                                <label>Border Radius (px)</label>
                                <input type="range" id="border-radius" min="0" max="32" step="1" value="${this.settings.borderRadius}">
                                <span id="border-radius-val">${this.settings.borderRadius}</span>
                            </div>
                            <div class="setting-row checkbox">
                                <label><input type="checkbox" id="compact-mode" ${this.settings.compactMode ? 'checked' : ''}> Compact Mode (more items)</label>
                            </div>
                            <div class="setting-row checkbox">
                                <label><input type="checkbox" id="show-avatars" ${this.settings.showAvatars ? 'checked' : ''}> Show Player Avatars</label>
                            </div>
                            <div class="setting-row checkbox">
                                <label><input type="checkbox" id="live-background" ${this.settings.liveBackground ? 'checked' : ''}> Live Background Effect</label>
                            </div>
                            <div class="setting-row">
                                <label>Custom Background Image</label>
                                <input type="file" id="bg-image-upload" accept="image/*">
                                <button id="clear-bg-image" class="small-btn">Clear</button>
                            </div>
                        </div>
                    </div>

                    <!-- Behavior Card -->
                    <div class="settings-card">
                        <div class="card-header">⏱️ Behavior</div>
                        <div class="card-body">
                            <div class="setting-row">
                                <label>Refresh Rate (seconds)</label>
                                <input type="range" id="refresh-rate" min="1" max="30" value="${this.settings.refreshRate}">
                                <span id="refresh-val">${this.settings.refreshRate}</span>
                            </div>
                            <div class="setting-row">
                                <label>Default Tab</label>
                                <select id="default-tab">
                                    <option value="home" ${this.settings.defaultTab === 'home' ? 'selected' : ''}>Home</option>
                                    <option value="players" ${this.settings.defaultTab === 'players' ? 'selected' : ''}>Players</option>
                                    <option value="master" ${this.settings.defaultTab === 'master' ? 'selected' : ''}>Master Control</option>
                                    <option value="economy" ${this.settings.defaultTab === 'economy' ? 'selected' : ''}>Economy</option>
                                    <option value="livemap" ${this.settings.defaultTab === 'livemap' ? 'selected' : ''}>Live Map</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Notifications Card -->
                    <div class="settings-card">
                        <div class="card-header">🔔 Notifications</div>
                        <div class="card-body">
                            <div class="setting-row checkbox">
                                <label><input type="checkbox" id="enable-notifications" ${this.settings.notifications ? 'checked' : ''}> Enable Notifications</label>
                            </div>
                            <div class="setting-row checkbox">
                                <label><input type="checkbox" id="sound-alerts" ${this.settings.soundAlerts ? 'checked' : ''}> Sound Alerts</label>
                            </div>
                            <div class="setting-row">
                                <label>Player Join Alerts</label>
                                <select id="join-alerts">
                                    <option value="all">All Players</option>
                                    <option value="friends">Friends Only</option>
                                    <option value="none">None</option>
                                </select>
                            </div>
                            <div class="setting-row">
                                <label>Event Alerts</label>
                                <select id="event-alerts">
                                    <option value="all">All Events</option>
                                    <option value="major">Major Events Only</option>
                                    <option value="none">None</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Security Card -->
                    <div class="settings-card">
                        <div class="card-header">🔐 Security</div>
                        <div class="card-body">
                            <div class="setting-row">
                                <label>Auto‑Lock (minutes)</label>
                                <input type="range" id="auto-lock" min="1" max="120" value="${this.settings.autoLock}">
                                <span id="lock-val">${this.settings.autoLock}</span>
                            </div>
                            <div class="setting-row checkbox">
                                <label><input type="checkbox" id="remember-me" checked> Remember Me</label>
                            </div>
                            ${this.access.hasRole('master') ? `
                            <div class="setting-row checkbox">
                                <label><input type="checkbox" id="two-factor"> Two‑Factor Authentication</label>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Accessibility Card -->
                    <div class="settings-card">
                        <div class="card-header">♿ Accessibility</div>
                        <div class="card-body">
                            <div class="setting-row checkbox">
                                <label><input type="checkbox" id="enable-animations" ${this.settings.animations ? 'checked' : ''}> Enable Animations</label>
                            </div>
                            <div class="setting-row checkbox">
                                <label><input type="checkbox" id="reduced-motion" ${this.settings.reducedMotion ? 'checked' : ''}> Reduced Motion</label>
                            </div>
                            <div class="setting-row">
                                <label>Language</label>
                                <select id="language-select">
                                    <option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>English</option>
                                    <option value="es">Español</option>
                                    <option value="de">Deutsch</option>
                                    <option value="fr">Français</option>
                                    <option value="ru">Русский</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Layout Management Card (Master only) -->
                    ${this.access.hasRole('master') ? `
                    <div class="settings-card">
                        <div class="card-header">📐 Layout Management</div>
                        <div class="card-body">
                            <div id="layout-list" class="layout-list"></div>
                            <div class="button-group" style="margin-top: 1rem;">
                                <button id="save-layout" class="settings-btn">💾 Save Current Layout</button>
                                <button id="reset-layout" class="settings-btn">↺ Reset to Default</button>
                            </div>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Sidebar Tabs Card -->
                    <div class="settings-card">
                        <div class="card-header">📑 Sidebar Tabs</div>
                        <div class="card-body">
                            <div id="sidebar-tabs-customizer"></div>
                        </div>
                    </div>

                    <!-- Data Management Card -->
                    <div class="settings-card">
                        <div class="card-header">💾 Data Management</div>
                        <div class="card-body">
                            <div class="button-group">
                                <button id="export-data" class="settings-btn">📤 EXPORT ALL DATA</button>
                                <button id="import-data" class="settings-btn">📥 IMPORT DATA</button>
                                <button id="clear-data" class="settings-btn warning">🗑️ CLEAR ALL DATA</button>
                            </div>
                            <div class="storage-info" style="margin-top: 1rem;">
                                <h4>Storage Usage</h4>
                                <div class="storage-bar"><div class="storage-used" style="width: 35%"></div></div>
                                <div>Used: ${(localStorage.length * 0.1).toFixed(1)} KB / 5 MB</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="settings-actions">
                    <button id="save-settings" class="settings-btn primary">💾 SAVE ALL SETTINGS</button>
                    <button id="reset-settings" class="settings-btn">🔄 RESET TO DEFAULT</button>
                </div>
            </div>
        `;

        if (this.access.hasRole('master')) this.renderLayoutList();
        this.setupRangeListeners();
        this.renderSidebarCustomizer();
        this.attachBackgroundUpload();
    }

    setupRangeListeners() {
        const ranges = [
            { id: 'refresh-rate', val: 'refresh-val' },
            { id: 'auto-lock', val: 'lock-val' },
            { id: 'glass-blur', val: 'glass-blur-val' },
            { id: 'border-radius', val: 'border-radius-val' }
        ];
        ranges.forEach(item => {
            const input = document.getElementById(item.id);
            const span = document.getElementById(item.val);
            if (input && span) {
                input.addEventListener('input', (e) => { span.innerText = e.target.value; });
            }
        });
    }

    attachBackgroundUpload() {
        const upload = document.getElementById('bg-image-upload');
        const clear = document.getElementById('clear-bg-image');
        if (upload) {
            upload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    this.settings.customBackground = ev.target.result;
                    this.applySettings();
                    toast.success('Background image applied');
                };
                reader.readAsDataURL(file);
            });
        }
        if (clear) {
            clear.addEventListener('click', () => {
                this.settings.customBackground = null;
                this.applySettings();
                toast.info('Background cleared');
            });
        }
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
    }

    renderSidebarCustomizer() {
        const container = document.getElementById('sidebar-tabs-customizer');
        if (container && window.sidebarManager && window.sidebarManager.getSelectionUI) {
            container.innerHTML = window.sidebarManager.getSelectionUI();
            window.sidebarManager.attachSettingsEvents();
        }
    }

    saveSettings() {
        // Gather all values
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
        this.settings.liveBackground = document.getElementById('live-background').checked;
        this.settings.fontSize = document.getElementById('font-size').value;
        this.settings.glassBlur = parseInt(document.getElementById('glass-blur').value);
        this.settings.borderRadius = parseInt(document.getElementById('border-radius').value);
        // customBackground already handled separately
        this.saveSettings();
        this.applySettings();
        toast.success('Settings saved');
    }

    applySettings() {
        // Theme
        document.body.className = `theme-${this.settings.theme}`;
        // Compact mode
        document.body.classList.toggle('compact', this.settings.compactMode);
        // Animations
        if (!this.settings.animations || this.settings.reducedMotion) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }
        // Live background
        if (this.settings.liveBackground && !this.settings.customBackground) {
            document.body.classList.remove('no-live-bg');
        } else if (this.settings.customBackground) {
            document.body.style.backgroundImage = `url(${this.settings.customBackground})`;
            document.body.classList.add('has-custom-bg');
            document.body.classList.remove('no-live-bg');
        } else {
            document.body.classList.add('no-live-bg');
            document.body.style.backgroundImage = '';
            document.body.classList.remove('has-custom-bg');
        }
        // Font size
        document.documentElement.style.fontSize = 
            this.settings.fontSize === 'small' ? '12px' :
            this.settings.fontSize === 'large' ? '16px' : '14px';
        // Glass blur and border radius
        document.documentElement.style.setProperty('--glass-blur', `${this.settings.glassBlur}px`);
        document.documentElement.style.setProperty('--border-radius', `${this.settings.borderRadius}px`);
        // Language
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
                reducedMotion: false,
                liveBackground: true,
                fontSize: 'medium',
                glassBlur: 16,
                borderRadius: 12,
                customBackground: null
            };
            this.saveSettings();
            // Also reset sidebar selection? Could but not required.
            this.refresh();
            toast.info('Settings reset');
        }
    }

    exportData() {
        const data = {
            settings: this.settings,
            layouts: this.layouts,
            timestamp: new Date().toISOString()
        };
        if (this.access.hasRole('master')) {
            data.users = localStorage.getItem('tdl_users');
            data.audit = localStorage.getItem('tdl_audit_log');
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
                    if (data.users && this.access.hasRole('master')) localStorage.setItem('tdl_users', data.users);
                    if (data.audit && this.access.hasRole('master')) localStorage.setItem('tdl_audit_log', data.audit);
                    toast.success('Data imported');
                    setTimeout(() => location.reload(), 1000);
                } catch (err) {
                    toast.error('Invalid import file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    clearData() {
        if (confirm('⚠️ DELETE ALL LOCAL DATA? This cannot be undone!')) {
            localStorage.clear();
            toast.error('All local data cleared');
            setTimeout(() => location.reload(), 1500);
        }
    }

    renderLayoutList() {
        const list = document.getElementById('layout-list');
        if (!list) return;
        if (this.layouts.saved.length === 0) {
            list.innerHTML = '<p>No saved layouts</p>';
            return;
        }
        let html = '';
        this.layouts.saved.forEach((layout, index) => {
            html += `<div class="layout-item"><span>${layout.name}</span><button class="small-btn load-layout" data-index="${index}">Load</button><button class="small-btn delete-layout" data-index="${index}">Delete</button></div>`;
        });
        list.innerHTML = html;
        list.querySelectorAll('.load-layout').forEach(btn => btn.addEventListener('click', (e) => this.loadLayout(parseInt(e.target.dataset.index))));
        list.querySelectorAll('.delete-layout').forEach(btn => btn.addEventListener('click', (e) => this.deleteLayout(parseInt(e.target.dataset.index))));
    }

    saveLayout() {
        const name = prompt('Enter layout name:');
        if (!name) return;
        const layout = { name, data: LayoutManager.loadLayout() || {}, created: new Date().toISOString() };
        this.layouts.saved.push(layout);
        this.saveLayouts();
        this.renderLayoutList();
        toast.success('Layout saved');
    }

    loadLayout(index) {
        const layout = this.layouts.saved[index];
        if (layout && layout.data) {
            LayoutManager.saveLayout(layout.data);
            toast.success(`Layout "${layout.name}" loaded`);
        }
    }

    deleteLayout(index) {
        if (confirm('Delete this layout?')) {
            this.layouts.saved.splice(index, 1);
            this.saveLayouts();
            this.renderLayoutList();
            toast.info('Layout deleted');
        }
    }

    resetLayout() {
        if (confirm('Reset layout to default?')) {
            LayoutManager.resetLayout();
            toast.info('Layout reset');
        }
    }

    refresh() {
        this.createHTML();
        this.attachEvents();
        if (this.access.hasRole('master')) this.renderLayoutList();
        this.renderSidebarCustomizer();
        toast.success('Settings refreshed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.settings = new Settings();
});