// THEME STUDIO - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class ThemeStudio {
    constructor(tablet) {
        this.tablet = tablet;
        this.themes = this.loadThemes();
        this.currentTheme = 'default';
        this.previewMode = false;
        this.init();
    }

    loadThemes() {
        const saved = localStorage.getItem('drained_themes');
        return saved ? JSON.parse(saved) : {
            default: {
                name: 'Rust Classic',
                primary: '#FFB100',
                background: '#0d0d0d',
                secondary: '#1a1a1a',
                text: '#FFB100',
                accent: '#aa8c4c',
                font: 'JetBrains Mono'
            },
            rust: {
                name: 'Rust Red',
                primary: '#B7410E',
                background: '#1a0f0a',
                secondary: '#2d1a12',
                text: '#B7410E',
                accent: '#8B4513',
                font: 'Courier New'
            },
            military: {
                name: 'Military Green',
                primary: '#4A7023',
                background: '#1a2412',
                secondary: '#2a371a',
                text: '#4A7023',
                accent: '#5F9F3A',
                font: 'Consolas'
            },
            neon: {
                name: 'Cyberpunk',
                primary: '#00ffaa',
                background: '#0a0f0f',
                secondary: '#1a2a2a',
                text: '#00ffaa',
                accent: '#ff00aa',
                font: 'Share Tech Mono'
            }
        };
    }

    saveThemes() {
        localStorage.setItem('drained_themes', JSON.stringify(this.themes));
    }

    init() {
        this.createThemeHTML();
        this.setupEventListeners();
        this.applyTheme(this.currentTheme);
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'theme') {
                this.refresh();
            }
        });
    }

    createThemeHTML() {
        const themeTab = document.getElementById('tab-theme');
        if (!themeTab) return;

        themeTab.innerHTML = `
            <div class="theme-container">
                <div class="theme-header">
                    <h2>🎨 THEME STUDIO</h2>
                    <div class="theme-controls">
                        <button id="preview-theme" class="theme-btn">👁️ PREVIEW</button>
                        <button id="reset-theme" class="theme-btn">🔄 RESET</button>
                    </div>
                </div>

                <div class="theme-grid">
                    <div class="theme-selector">
                        <h3>PRESET THEMES</h3>
                        <div class="preset-grid" id="preset-grid"></div>
                    </div>

                    <div class="theme-customizer">
                        <h3>CUSTOMIZE</h3>
                        
                        <div class="customizer-section">
                            <h4>Colors</h4>
                            <div class="color-picker">
                                <label>Primary:
                                    <input type="color" id="color-primary" value="#FFB100">
                                </label>
                                <label>Background:
                                    <input type="color" id="color-bg" value="#0d0d0d">
                                </label>
                                <label>Text:
                                    <input type="color" id="color-text" value="#FFB100">
                                </label>
                                <label>Accent:
                                    <input type="color" id="color-accent" value="#aa8c4c">
                                </label>
                            </div>
                        </div>

                        <div class="customizer-section">
                            <h4>Fonts</h4>
                            <select id="font-select">
                                <option value="JetBrains Mono">JetBrains Mono</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Consolas">Consolas</option>
                                <option value="Share Tech Mono">Share Tech Mono</option>
                                <option value="Fira Code">Fira Code</option>
                            </select>
                        </div>

                        <div class="customizer-section">
                            <h4>Layout</h4>
                            <div class="layout-options">
                                <label>
                                    <input type="radio" name="layout" value="compact" checked> Compact
                                </label>
                                <label>
                                    <input type="radio" name="layout" value="comfortable"> Comfortable
                                </label>
                                <label>
                                    <input type="radio" name="layout" value="spacious"> Spacious
                                </label>
                            </div>
                        </div>

                        <div class="customizer-section">
                            <h4>Icons</h4>
                            <div class="icon-style">
                                <label>
                                    <input type="radio" name="icons" value="default" checked> Default
                                </label>
                                <label>
                                    <input type="radio" name="icons" value="minimal"> Minimal
                                </label>
                                <label>
                                    <input type="radio" name="icons" value="colored"> Colored
                                </label>
                            </div>
                        </div>

                        <div class="theme-actions">
                            <button id="save-theme" class="theme-btn primary">SAVE THEME</button>
                            <button id="export-theme" class="theme-btn">📤 EXPORT</button>
                            <button id="import-theme" class="theme-btn">📥 IMPORT</button>
                        </div>
                    </div>

                    <div class="theme-preview">
                        <h3>PREVIEW</h3>
                        <div class="preview-card" id="theme-preview">
                            <div class="preview-header">
                                <span class="preview-title">THE DRAINED TABLET</span>
                                <span class="preview-badge">PREVIEW</span>
                            </div>
                            <div class="preview-content">
                                <div class="preview-button">Button</div>
                                <div class="preview-slider">
                                    <div class="slider-track"></div>
                                </div>
                                <div class="preview-text">
                                    Sample text with <span class="preview-accent">accent</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="icon-library">
                    <h3>RUST ICONS</h3>
                    <div class="icon-grid" id="icon-grid"></div>
                </div>
            </div>
        `;

        this.renderPresets();
        this.renderIcons();
    }

    setupEventListeners() {
        document.getElementById('preview-theme')?.addEventListener('click', () => this.togglePreview());
        document.getElementById('reset-theme')?.addEventListener('click', () => this.resetTheme());
        document.getElementById('save-theme')?.addEventListener('click', () => this.saveCustomTheme());
        document.getElementById('export-theme')?.addEventListener('click', () => this.exportTheme());
        document.getElementById('import-theme')?.addEventListener('click', () => this.importTheme());

        // Live preview on color change
        document.getElementById('color-primary')?.addEventListener('input', () => this.updatePreview());
        document.getElementById('color-bg')?.addEventListener('input', () => this.updatePreview());
        document.getElementById('color-text')?.addEventListener('input', () => this.updatePreview());
        document.getElementById('color-accent')?.addEventListener('input', () => this.updatePreview());
        document.getElementById('font-select')?.addEventListener('change', () => this.updatePreview());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('preset-theme')) {
                const theme = e.target.dataset.theme;
                this.loadPreset(theme);
            }
            if (e.target.classList.contains('icon-item')) {
                const icon = e.target.dataset.icon;
                this.useIcon(icon);
            }
        });
    }

    renderPresets() {
        const grid = document.getElementById('preset-grid');
        
        let html = '';
        Object.entries(this.themes).forEach(([key, theme]) => {
            if (key !== 'custom') {
                html += `
                    <div class="preset-item" style="border-color: ${theme.primary}">
                        <div class="preset-preview" style="background: ${theme.background}">
                            <span style="color: ${theme.primary}">A</span>
                        </div>
                        <div class="preset-name">${theme.name}</div>
                        <button class="preset-theme small-btn" data-theme="${key}">LOAD</button>
                    </div>
                `;
            }
        });

        grid.innerHTML = html;
    }

    renderIcons() {
        const grid = document.getElementById('icon-grid');
        const icons = ['🔫', '⚔️', '🛡️', '💊', '🔧', '🏗️', '🚗', '🏭', '🌲', '🪓', '⛏️', '🔨', '📦', '💰', '⚙️', '🔩', '🧱', '🪵', '🔥', '💣'];

        let html = '';
        icons.forEach(icon => {
            html += `
                <div class="icon-item" data-icon="${icon}">
                    ${icon}
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    loadPreset(themeKey) {
        const theme = this.themes[themeKey];
        if (theme) {
            document.getElementById('color-primary').value = theme.primary;
            document.getElementById('color-bg').value = theme.background;
            document.getElementById('color-text').value = theme.text;
            document.getElementById('color-accent').value = theme.accent;
            document.getElementById('font-select').value = theme.font;

            this.applyTheme(themeKey);
            this.tablet.showToast(`Loaded ${theme.name} theme`, 'success');
        }
    }

    applyTheme(themeKey) {
        const theme = this.themes[themeKey];
        if (!theme) return;

        document.documentElement.style.setProperty('--amber', theme.primary);
        document.documentElement.style.setProperty('--bg-primary', theme.background);
        document.documentElement.style.setProperty('--bg-secondary', theme.secondary || '#1a1a1a');
        document.documentElement.style.setProperty('--text-primary', theme.text);
        document.documentElement.style.setProperty('--text-secondary', theme.accent);

        this.currentTheme = themeKey;
    }

    updatePreview() {
        const preview = document.getElementById('theme-preview');
        const primary = document.getElementById('color-primary').value;
        const bg = document.getElementById('color-bg').value;
        const text = document.getElementById('color-text').value;
        const accent = document.getElementById('color-accent').value;

        preview.style.backgroundColor = bg;
        preview.style.color = text;
        preview.style.borderColor = primary;

        preview.querySelector('.preview-title').style.color = primary;
        preview.querySelector('.preview-badge').style.backgroundColor = primary;
        preview.querySelector('.preview-button').style.backgroundColor = primary;
        preview.querySelector('.preview-accent').style.color = accent;
    }

    togglePreview() {
        this.previewMode = !this.previewMode;
        if (this.previewMode) {
            this.updatePreview();
            document.getElementById('preview-theme').classList.add('active');
        } else {
            this.applyTheme(this.currentTheme);
            document.getElementById('preview-theme').classList.remove('active');
        }
    }

    resetTheme() {
        this.loadPreset('default');
        this.tablet.showToast('Reset to default theme', 'success');
    }

    saveCustomTheme() {
        const name = prompt('Enter theme name:');
        if (!name) return;

        const customTheme = {
            name: name,
            primary: document.getElementById('color-primary').value,
            background: document.getElementById('color-bg').value,
            secondary: '#1a1a1a',
            text: document.getElementById('color-text').value,
            accent: document.getElementById('color-accent').value,
            font: document.getElementById('font-select').value
        };

        const key = 'custom_' + Date.now();
        this.themes[key] = customTheme;
        this.saveThemes();
        this.renderPresets();
        this.tablet.showToast(`Theme "${name}" saved`, 'success');
    }

    exportTheme() {
        const currentTheme = {
            primary: document.getElementById('color-primary').value,
            background: document.getElementById('color-bg').value,
            text: document.getElementById('color-text').value,
            accent: document.getElementById('color-accent').value,
            font: document.getElementById('font-select').value
        };

        const json = JSON.stringify(currentTheme, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'drained-theme.json';
        a.click();
    }

    importTheme() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const theme = JSON.parse(event.target.result);
                    document.getElementById('color-primary').value = theme.primary;
                    document.getElementById('color-bg').value = theme.background;
                    document.getElementById('color-text').value = theme.text;
                    document.getElementById('color-accent').value = theme.accent;
                    document.getElementById('font-select').value = theme.font;
                    this.updatePreview();
                    this.tablet.showToast('Theme imported', 'success');
                } catch (err) {
                    this.tablet.showError('Invalid theme file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    useIcon(icon) {
        // Would apply icon to selected element
        this.tablet.showToast(`Icon ${icon} selected`, 'info');
    }

    refresh() {
        this.renderPresets();
        this.renderIcons();
        this.tablet.showToast('Theme studio refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.themeStudio = new ThemeStudio(window.drainedTablet);
});