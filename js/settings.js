// settings.js – DRAINED TABLET ULTIMATE v7.0.0
// Dashboard settings: user preferences, export/import, layout customization,
// theme, notifications, security, sidebar tab selection, and background effects.
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
            theme: 'crimson',      // now crimson is default
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
            backgroundEffect: 'fire'  // 'fire', 'smoke', 'static', 'custom'
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
        this.applyBackgroundEffect();
    }

    saveLayouts() {
        localStorage.setItem('tdl_layouts', JSON.stringify(this.layouts));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.applySettings(); // ensure initial theme etc.
        this.applyBackgroundEffect();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'settings') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-settings');
        if (!tab) return;

        // Build HTML with all sections, including new Background & Effects section
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
                                <option value="crimson" ${this.settings.theme === 'crimson' ? 'selected' : ''}>Crimson Red</option>
                                <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Pure Dark</option>
                                <option value="amber" ${this.settings.theme === 'amber' ? 'selected' : ''}>Amber Glow</option>
                                <option value="military" ${this.settings.theme === 'military' ? 'selected' : ''}>Military Green</option>
                                <option value="neon" ${this.settings.theme === 'neon' ? 'selected' : ''}>Cyberpunk</option>
                                <option value="light" ${this.settings.theme === 'light' ? 'selected' : ''}>Light Theme</option>
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

                    <!-- Background & Effects Section -->
                    <div class="settings-section">
                        <h3>🔥 Background & Effects</h3>
                        <div class="setting-item">
                            <label>Background Effect:</label>
                            <select id="bg-effect-select">
                                <option value="fire" ${this.settings.backgroundEffect === 'fire' ? 'selected' : ''}>Live Fire</option>
                                <option value="smoke" ${this.settings.backgroundEffect === 'smoke' ? 'selected' : ''}>Drifting Smoke</option>
                                <option value="static" ${this.settings.backgroundEffect === 'static' ? 'selected' : ''}>Static Dark</option>
                                <option value="custom" ${this.settings.backgroundEffect === 'custom' ? 'selected' : ''}>Custom Upload</option>
                            </select>
                        </div>
                        <div id="custom-bg-upload" style="display: none; margin-top: 1rem;">
                            <label>Upload your own background image/video:</label>
                            <input type="file" id="custom-bg-file" accept="image/*,video/*">
                            <button id="apply-custom-bg" class="small-btn" style="margin-top: 0.5rem;">Apply</button>
                        </div>
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="enable-smoke" checked> Enable Smoke Particles
                            </label>
                        </div>
                        <p class="hint" style="font-size: 0.8rem; margin-top: 0.5rem;">Live fire & smoke create an immersive atmosphere.</p>
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

                    <!-- Sidebar Tabs Section -->
                    <div class="settings-section">
                        <h3>📑 Sidebar Tabs</h3>
                        <div id="sidebar-tabs-customizer"></div>
                    </div>

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
        this.renderSidebarCustomizer();
        this.attachBackgroundEvents();
    }

    attachBackgroundEvents() {
        const bgSelect = document.getElementById('bg-effect-select');
        const customDiv = document.getElementById('custom-bg-upload');
        bgSelect.addEventListener('change', (e) => {
            customDiv.style.display = e.target.value === 'custom' ? 'block' : 'none';
            this.settings.backgroundEffect = e.target.value;
            this.applyBackgroundEffect();
        });
        document.getElementById('apply-custom-bg')?.addEventListener('click', () => {
            const fileInput = document.getElementById('custom-bg-file');
            const file = fileInput.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                this.setCustomBackground(url);
                this.settings.backgroundEffect = 'custom';
                this.settings.customBgUrl = url;
                this.saveSettings();
                toast.success('Custom background applied');
            }
        });
        document.getElementById('enable-smoke')?.addEventListener('change', (e) => {
            localStorage.setItem('tdl_enable_smoke', e.target.checked);
            this.applyBackgroundEffect();
        });
    }

    setCustomBackground(url) {
        let bgDiv = document.getElementById('custom-bg-layer');
        if (!bgDiv) {
            bgDiv = document.createElement('div');
            bgDiv.id = 'custom-bg-layer';
            bgDiv.style.position = 'fixed';
            bgDiv.style.top = '0';
            bgDiv.style.left = '0';
            bgDiv.style.width = '100%';
            bgDiv.style.height = '100%';
            bgDiv.style.zIndex = '-1';
            bgDiv.style.pointerEvents = 'none';
            document.body.appendChild(bgDiv);
        }
        if (url.match(/\.(mp4|webm)$/i)) {
            bgDiv.innerHTML = `<video autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover;"><source src="${url}" type="video/mp4"></video>`;
        } else {
            bgDiv.innerHTML = `<div style="background:url('${url}') center/cover no-repeat; width:100%; height:100%;"></div>`;
        }
    }

    applyBackgroundEffect() {
        const effect = this.settings.backgroundEffect;
        const enableSmoke = document.getElementById('enable-smoke')?.checked;
        // Remove existing fire/smoke layers if any
        const existingFire = document.getElementById('fire-canvas');
        if (existingFire) existingFire.remove();
        const existingSmoke = document.getElementById('smoke-container');
        if (existingSmoke) existingSmoke.remove();

        if (effect === 'fire') {
            this.startFireAnimation();
        } else if (effect === 'smoke') {
            this.startSmokeParticles();
        } else if (effect === 'static') {
            // nothing extra
        } else if (effect === 'custom' && this.settings.customBgUrl) {
            this.setCustomBackground(this.settings.customBgUrl);
        }
        if (enableSmoke && effect !== 'smoke') {
            this.startSmokeParticles(); // add smoke overlay anyway
        }
    }

    startFireAnimation() {
        const canvas = document.createElement('canvas');
        canvas.id = 'fire-canvas';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        const updateSize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        window.addEventListener('resize', updateSize);
        const firePixels = [];
        const numParticles = 150;
        for (let i = 0; i < numParticles; i++) {
            firePixels.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: 5 + Math.random() * 15,
                speedX: (Math.random() - 0.5) * 0.8,
                speedY: (Math.random() - 0.5) * 0.8,
                life: 0.3 + Math.random() * 0.7
            });
        }
        function drawFire() {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);
            for (let p of firePixels) {
                const intensity = p.life * 0.8;
                const r = 255;
                const g = 70 + Math.floor(intensity * 100);
                const b = 30;
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${intensity * 0.7})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * (0.5 + intensity), 0, Math.PI * 2);
                ctx.fill();
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;
                p.life += 0.005;
                if (p.life > 1) p.life = 0.3;
            }
            requestAnimationFrame(drawFire);
        }
        drawFire();
    }

    startSmokeParticles() {
        const container = document.createElement('div');
        container.id = 'smoke-container';
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '-1';
        document.body.appendChild(container);
        for (let i = 0; i < 45; i++) {
            const smoke = document.createElement('div');
            smoke.className = 'smoke-particle';
            const size = 60 + Math.random() * 200;
            smoke.style.width = `${size}px`;
            smoke.style.height = `${size}px`;
            smoke.style.left = `${Math.random() * 100}%`;
            smoke.style.animationDelay = `${Math.random() * 15}s`;
            smoke.style.animationDuration = `${15 + Math.random() * 20}s`;
            container.appendChild(smoke);
        }
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

    renderSidebarCustomizer() {
        const container = document.getElementById('sidebar-tabs-customizer');
        if (!container) return;
        if (window.sidebarManager && window.sidebarManager.getSelectionUI) {
            container.innerHTML = window.sidebarManager.getSelectionUI();
            window.sidebarManager.attachSettingsEvents();
        } else {
            container.innerHTML = '<p>Sidebar manager not loaded yet.</p>';
        }
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
        this.settings.backgroundEffect = document.getElementById('bg-effect-select').value;

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
        document.documentElement.lang = this.settings.language;
    }

    resetSettings() {
        if (confirm('Reset all settings to default?')) {
            this.settings = {
                defaultTab: 'home',
                theme: 'crimson',
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
                backgroundEffect: 'fire'
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
            document.getElementById('bg-effect-select').value = this.settings.backgroundEffect;

            this.tablet.showToast('Settings reset', 'info');
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
        this.renderSidebarCustomizer();
        this.tablet.showToast('Settings refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.settings = new Settings();
});