// settings.js – DRAINED TABLET ULTIMATE v7.0.0
// Dashboard settings: appearance, theme, live background, animations, layout, data management.

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
            theme: 'dark',
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
            backgroundImage: null,
            customPrimaryColor: '#f0a500',
            customSecondaryColor: '#2a7f3e',
            glassBlur: 16,
            borderRadius: 12
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

    saveLayouts() { localStorage.setItem('tdl_layouts', JSON.stringify(this.layouts)); }

    init() {
        this.createHTML();
        this.attachEvents();
        this.applySettings();
        window.addEventListener('tab-changed', (e) => { if (e.detail.tab === 'settings') this.refresh(); });
    }

    createHTML() {
        const tab = document.getElementById('tab-settings');
        if (!tab) return;
        tab.innerHTML = `
            <div class="settings-container">
                <div class="settings-header"><h2>⚙️ DASHBOARD SETTINGS</h2></div>
                <div class="settings-grid">
                    <!-- Appearance -->
                    <div class="settings-section">
                        <h3>🎨 Appearance</h3>
                        <div class="setting-item"><label>Theme Preset:</label><select id="theme-preset"><option value="dark">Dark (Default)</option><option value="light">Light</option><option value="rust">Rust Red</option><option value="military">Military Green</option><option value="neon">Cyberpunk</option><option value="custom">Custom</option></select></div>
                        <div id="custom-colors" style="display: none;">
                            <div class="setting-item"><label>Primary Color:</label><input type="color" id="primary-color" value="${this.settings.customPrimaryColor}"></div>
                            <div class="setting-item"><label>Secondary Color:</label><input type="color" id="secondary-color" value="${this.settings.customSecondaryColor}"></div>
                        </div>
                        <div class="setting-item"><label>Glass Blur (px):</label><input type="range" id="glass-blur" min="0" max="30" step="1" value="${this.settings.glassBlur}"> <span id="glass-blur-val">${this.settings.glassBlur}</span></div>
                        <div class="setting-item"><label>Border Radius (px):</label><input type="range" id="border-radius" min="0" max="32" step="2" value="${this.settings.borderRadius}"> <span id="border-radius-val">${this.settings.borderRadius}</span></div>
                        <div class="checkbox-item"><label><input type="checkbox" id="compact-mode" ${this.settings.compactMode ? 'checked' : ''}> Compact Mode</label></div>
                        <div class="checkbox-item"><label><input type="checkbox" id="show-avatars" ${this.settings.showAvatars ? 'checked' : ''}> Show Player Avatars</label></div>
                    </div>
                    <!-- Background -->
                    <div class="settings-section">
                        <h3>🖼️ Background</h3>
                        <div class="checkbox-item"><label><input type="checkbox" id="live-background" ${this.settings.liveBackground ? 'checked' : ''}> Live Background Effect</label></div>
                        <div class="setting-item"><label>Custom Background Image:</label><input type="file" id="bg-image-upload" accept="image/*"><button id="clear-bg-image" class="small-btn">Clear</button></div>
                        <div class="setting-item"><label>Background Position:</label><select id="bg-position"><option value="center">Center</option><option value="top">Top</option><option value="bottom">Bottom</option><option value="left">Left</option><option value="right">Right</option></select></div>
                        <div class="setting-item"><label>Background Size:</label><select id="bg-size"><option value="cover">Cover</option><option value="contain">Contain</option><option value="auto">Auto</option></select></div>
                    </div>
                    <!-- Behavior -->
                    <div class="settings-section">
                        <h3>⏱️ Behavior</h3>
                        <div class="setting-item"><label>Refresh Rate: <span id="refresh-val">${this.settings.refreshRate}</span> sec</label><input type="range" id="refresh-rate" min="1" max="30" value="${this.settings.refreshRate}"></div>
                        <div class="setting-item"><label>Default Tab:</label><select id="default-tab"><option value="home">Home</option><option value="profile">Profile</option><option value="drained-bases">Drained Bases</option><option value="shop">Shop</option><option value="claims">Claims</option></select></div>
                        <div class="checkbox-item"><label><input type="checkbox" id="enable-notifications" ${this.settings.notifications ? 'checked' : ''}> Notifications</label></div>
                        <div class="checkbox-item"><label><input type="checkbox" id="sound-alerts" ${this.settings.soundAlerts ? 'checked' : ''}> Sound Alerts</label></div>
                    </div>
                    <!-- Security -->
                    <div class="settings-section">
                        <h3>🔐 Security</h3>
                        <div class="setting-item"><label>Auto‑Lock (min): <span id="lock-val">${this.settings.autoLock}</span></label><input type="range" id="auto-lock" min="1" max="120" value="${this.settings.autoLock}"></div>
                        <div class="checkbox-item"><label><input type="checkbox" id="remember-me" checked> Remember Me</label></div>
                    </div>
                    <!-- Accessibility -->
                    <div class="settings-section">
                        <h3>♿ Accessibility</h3>
                        <div class="checkbox-item"><label><input type="checkbox" id="enable-animations" ${this.settings.animations ? 'checked' : ''}> Enable Animations</label></div>
                        <div class="checkbox-item"><label><input type="checkbox" id="reduced-motion" ${this.settings.reducedMotion ? 'checked' : ''}> Reduced Motion</label></div>
                        <div class="setting-item"><label>Language:</label><select id="language-select"><option value="en">English</option><option value="es">Español</option><option value="de">Deutsch</option></select></div>
                    </div>
                    <!-- Layout Management (master only) -->
                    ${this.access.hasRole('master') ? `
                    <div class="settings-section"><h3>📐 Layout Management</h3><div id="layout-list" class="layout-list"></div><button id="save-layout" class="settings-btn">💾 Save Current Layout</button><button id="reset-layout" class="settings-btn">↺ Reset to Default</button></div>
                    ` : ''}
                    <!-- Sidebar Tabs -->
                    <div class="settings-section"><h3>📑 Sidebar Tabs</h3><div id="sidebar-tabs-customizer"></div></div>
                    <!-- Data Management -->
                    <div class="settings-section">
                        <h3>💾 Data Management</h3>
                        <div class="button-group"><button id="export-data" class="settings-btn">📤 EXPORT ALL DATA</button><button id="import-data" class="settings-btn">📥 IMPORT DATA</button><button id="clear-data" class="settings-btn warning">🗑️ CLEAR ALL DATA</button></div>
                        <div class="storage-info"><h4>Storage Usage</h4><div class="storage-bar"><div class="storage-used" style="width: 35%"></div></div><div>Used: 2.4 MB / 10 MB</div></div>
                    </div>
                </div>
                <div class="settings-actions"><button id="save-settings" class="settings-btn primary">💾 SAVE SETTINGS</button><button id="reset-settings" class="settings-btn">🔄 RESET TO DEFAULT</button></div>
            </div>
        `;
        this.setupRangeListeners();
        this.renderLayoutList();
        this.renderSidebarCustomizer();
        this.handlePresetTheme();
    }

    setupRangeListeners() {
        ['refresh-rate', 'auto-lock', 'glass-blur', 'border-radius'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', (e) => {
                const span = document.getElementById(`${id}-val`);
                if (span) span.innerText = e.target.value;
            });
        });
    }

    handlePresetTheme() {
        const presetSelect = document.getElementById('theme-preset');
        const customColors = document.getElementById('custom-colors');
        if (!presetSelect) return;
        presetSelect.addEventListener('change', (e) => {
            const preset = e.target.value;
            customColors.style.display = preset === 'custom' ? 'block' : 'none';
            if (preset !== 'custom') {
                this.applyThemePreset(preset);
            }
        });
        // Default: show custom if already custom
        if (presetSelect.value === 'custom') customColors.style.display = 'block';
    }

    applyThemePreset(preset) {
        const themes = {
            dark: { primary: '#f0a500', secondary: '#2a7f3e' },
            light: { primary: '#b8860b', secondary: '#2a6230' },
            rust: { primary: '#b7410e', secondary: '#8b4513' },
            military: { primary: '#4a7023', secondary: '#5f9f3a' },
            neon: { primary: '#00ffaa', secondary: '#ff00aa' }
        };
        if (themes[preset]) {
            document.getElementById('primary-color').value = themes[preset].primary;
            document.getElementById('secondary-color').value = themes[preset].secondary;
            this.settings.customPrimaryColor = themes[preset].primary;
            this.settings.customSecondaryColor = themes[preset].secondary;
        }
    }

    attachEvents() {
        document.getElementById('save-settings')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-settings')?.addEventListener('click', () => this.resetSettings());
        document.getElementById('export-data')?.addEventListener('click', () => this.exportData());
        document.getElementById('import-data')?.addEventListener('click', () => this.importData());
        document.getElementById('clear-data')?.addEventListener('click', () => this.clearData());
        document.getElementById('bg-image-upload')?.addEventListener('change', (e) => this.uploadBackground(e));
        document.getElementById('clear-bg-image')?.addEventListener('click', () => this.clearBackground());
        if (this.access.hasRole('master')) {
            document.getElementById('save-layout')?.addEventListener('click', () => this.saveLayout());
            document.getElementById('reset-layout')?.addEventListener('click', () => this.resetLayout());
        }
    }

    uploadBackground(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.settings.backgroundImage = e.target.result;
            this.saveSettings();
            toast.success('Background image uploaded');
        };
        reader.readAsDataURL(file);
    }

    clearBackground() {
        this.settings.backgroundImage = null;
        this.saveSettings();
        toast.info('Background image cleared');
    }

    saveSettings() {
        // Gather all values from UI
        this.settings.defaultTab = document.getElementById('default-tab').value;
        this.settings.theme = document.getElementById('theme-preset').value;
        this.settings.sidebarPosition = 'left'; // not used in UI currently
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
        this.settings.glassBlur = parseInt(document.getElementById('glass-blur').value);
        this.settings.borderRadius = parseInt(document.getElementById('border-radius').value);
        this.settings.customPrimaryColor = document.getElementById('primary-color').value;
        this.settings.customSecondaryColor = document.getElementById('secondary-color').value;
        // Background position/size not saved in settings object? add them
        this.settings.bgPosition = document.getElementById('bg-position').value;
        this.settings.bgSize = document.getElementById('bg-size').value;
        
        this.saveSettings();
        this.applySettings();
        toast.success('Settings saved');
    }

    applySettings() {
        // Apply theme (custom colors or preset)
        const preset = this.settings.theme;
        let primary, secondary;
        if (preset === 'custom') {
            primary = this.settings.customPrimaryColor;
            secondary = this.settings.customSecondaryColor;
        } else {
            const themes = {
                dark: { primary: '#f0a500', secondary: '#2a7f3e' },
                light: { primary: '#b8860b', secondary: '#2a6230' },
                rust: { primary: '#b7410e', secondary: '#8b4513' },
                military: { primary: '#4a7023', secondary: '#5f9f3a' },
                neon: { primary: '#00ffaa', secondary: '#ff00aa' }
            };
            primary = themes[preset]?.primary || '#f0a500';
            secondary = themes[preset]?.secondary || '#2a7f3e';
        }
        document.documentElement.style.setProperty('--accent-primary', primary);
        document.documentElement.style.setProperty('--accent-secondary', secondary);
        document.documentElement.style.setProperty('--glass-blur', `${this.settings.glassBlur}px`);
        document.documentElement.style.setProperty('--border-radius', `${this.settings.borderRadius}px`);
        
        // Compact mode
        if (this.settings.compactMode) document.body.classList.add('compact');
        else document.body.classList.remove('compact');
        
        // Animations
        if (!this.settings.animations || this.settings.reducedMotion) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
        
        // Live background
        if (this.settings.liveBackground) {
            document.body.classList.remove('no-live-bg');
        } else {
            document.body.classList.add('no-live-bg');
        }
        
        // Custom background image
        if (this.settings.backgroundImage) {
            document.body.style.backgroundImage = `url(${this.settings.backgroundImage})`;
            document.body.style.backgroundPosition = this.settings.bgPosition || 'center';
            document.body.style.backgroundSize = this.settings.bgSize || 'cover';
            document.body.classList.add('has-custom-bg');
        } else {
            document.body.style.backgroundImage = '';
            document.body.classList.remove('has-custom-bg');
        }
        
        // Language (simple)
        document.documentElement.lang = this.settings.language;
    }

    resetSettings() {
        if (confirm('Reset all settings to default?')) {
            this.settings = {
                defaultTab: 'home',
                theme: 'dark',
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
                backgroundImage: null,
                customPrimaryColor: '#f0a500',
                customSecondaryColor: '#2a7f3e',
                glassBlur: 16,
                borderRadius: 12,
                bgPosition: 'center',
                bgSize: 'cover'
            };
            this.saveSettings();
            // Reload page to reset UI
            location.reload();
        }
    }

    exportData() {
        const data = { settings: this.settings, layouts: this.layouts, timestamp: new Date().toISOString() };
        if (this.access.hasRole('master')) {
            data.users = localStorage.getItem('tdl_users');
            data.audit = localStorage.getItem('tdl_audit_log');
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
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
                    if (data.settings) { this.settings = { ...this.settings, ...data.settings }; this.saveSettings(); }
                    if (data.layouts && this.access.hasRole('master')) { this.layouts = data.layouts; this.saveLayouts(); }
                    if (data.users && this.access.hasRole('master')) localStorage.setItem('tdl_users', data.users);
                    if (data.audit && this.access.hasRole('master')) localStorage.setItem('tdl_audit_log', data.audit);
                    toast.success('Data imported');
                    setTimeout(() => location.reload(), 1000);
                } catch { toast.error('Invalid import file'); }
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
        if (!list || !this.access.hasRole('master')) return;
        if (this.layouts.saved.length === 0) list.innerHTML = '<p>No saved layouts</p>';
        else {
            let html = '';
            this.layouts.saved.forEach((layout, index) => {
                html += `<div class="layout-item"><span>${layout.name}</span><button class="small-btn load-layout" data-index="${index}">Load</button><button class="small-btn delete-layout" data-index="${index}">Delete</button></div>`;
            });
            list.innerHTML = html;
            list.querySelectorAll('.load-layout').forEach(btn => btn.addEventListener('click', (e) => this.loadLayout(parseInt(e.target.dataset.index))));
            list.querySelectorAll('.delete-layout').forEach(btn => btn.addEventListener('click', (e) => this.deleteLayout(parseInt(e.target.dataset.index))));
        }
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
        if (layout && layout.data) { LayoutManager.saveLayout(layout.data); toast.success(`Layout "${layout.name}" loaded`); }
    }

    deleteLayout(index) {
        if (confirm('Delete this layout?')) { this.layouts.saved.splice(index, 1); this.saveLayouts(); this.renderLayoutList(); toast.info('Layout deleted'); }
    }

    resetLayout() {
        if (confirm('Reset layout to default?')) { LayoutManager.resetLayout(); toast.info('Layout reset'); }
    }

    renderSidebarCustomizer() {
        const container = document.getElementById('sidebar-tabs-customizer');
        if (container && window.sidebarManager && window.sidebarManager.getSelectionUI) {
            container.innerHTML = window.sidebarManager.getSelectionUI();
            window.sidebarManager.attachSettingsEvents();
        }
    }

    refresh() {
        this.renderLayoutList();
        this.renderSidebarCustomizer();
        toast.success('Settings refreshed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.settings = new Settings();
});