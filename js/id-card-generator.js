// id-card-generator.js – DRAINED TABLET ULTIMATE v7.0.0
// Customizable ID card generator with download and preview.

class IDCardGenerator {
    constructor() {
        this.tablet = window.drainedTablet;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.cardWidth = 600;
        this.cardHeight = 350;
        this.canvas.width = this.cardWidth;
        this.canvas.height = this.cardHeight;
        this.settings = this.loadSettings();
        this.init();
    }

    loadSettings() {
        const saved = localStorage.getItem('tdl_idcard_settings');
        return saved ? JSON.parse(saved) : {
            background: '#0B0F14',
            borderStyle: 'solid',
            accentColor: '#D4AF37',
            logoPosition: 'top',
            showPlatform: true,
            showRole: true
        };
    }

    saveSettings() {
        localStorage.setItem('tdl_idcard_settings', JSON.stringify(this.settings));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.updatePreview();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'idcard') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-idcard');
        if (!tab) return;
        tab.innerHTML = `
            <div class="idcard-container">
                <div class="idcard-header">
                    <h2>🪪 ID CARD GENERATOR</h2>
                </div>

                <div class="idcard-grid">
                    <div class="idcard-preview">
                        <h3>PREVIEW</h3>
                        <canvas id="idcard-canvas" width="${this.cardWidth}" height="${this.cardHeight}" class="idcard-canvas"></canvas>
                        <button id="idcard-download" class="idcard-btn">⬇️ DOWNLOAD</button>
                    </div>

                    <div class="idcard-customizer">
                        <h3>CUSTOMIZE</h3>
                        <div class="form-group">
                            <label>Background Color:</label>
                            <input type="color" id="idcard-bg" value="${this.settings.background}">
                        </div>
                        <div class="form-group">
                            <label>Border Style:</label>
                            <select id="idcard-border">
                                <option value="solid" ${this.settings.borderStyle === 'solid' ? 'selected' : ''}>Solid</option>
                                <option value="glow" ${this.settings.borderStyle === 'glow' ? 'selected' : ''}>Glow</option>
                                <option value="gradient" ${this.settings.borderStyle === 'gradient' ? 'selected' : ''}>Gradient</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Accent Color:</label>
                            <input type="color" id="idcard-accent" value="${this.settings.accentColor}">
                        </div>
                        <div class="form-group">
                            <label>Logo Position:</label>
                            <select id="idcard-logo-pos">
                                <option value="top" ${this.settings.logoPosition === 'top' ? 'selected' : ''}>Top</option>
                                <option value="bottom" ${this.settings.logoPosition === 'bottom' ? 'selected' : ''}>Bottom</option>
                                <option value="none" ${this.settings.logoPosition === 'none' ? 'selected' : ''}>None</option>
                            </select>
                        </div>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="idcard-show-platform" ${this.settings.showPlatform ? 'checked' : ''}> Show Platform
                            </label>
                            <label>
                                <input type="checkbox" id="idcard-show-role" ${this.settings.showRole ? 'checked' : ''}> Show Role
                            </label>
                        </div>
                        <button id="idcard-save" class="idcard-btn primary">💾 SAVE SETTINGS</button>
                    </div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        document.getElementById('idcard-bg')?.addEventListener('input', () => this.updatePreview());
        document.getElementById('idcard-border')?.addEventListener('change', () => this.updatePreview());
        document.getElementById('idcard-accent')?.addEventListener('input', () => this.updatePreview());
        document.getElementById('idcard-logo-pos')?.addEventListener('change', () => this.updatePreview());
        document.getElementById('idcard-show-platform')?.addEventListener('change', () => this.updatePreview());
        document.getElementById('idcard-show-role')?.addEventListener('change', () => this.updatePreview());
        document.getElementById('idcard-save')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('idcard-download')?.addEventListener('click', () => this.download());
    }

    updatePreview() {
        // Read current settings from UI
        this.settings.background = document.getElementById('idcard-bg').value;
        this.settings.borderStyle = document.getElementById('idcard-border').value;
        this.settings.accentColor = document.getElementById('idcard-accent').value;
        this.settings.logoPosition = document.getElementById('idcard-logo-pos').value;
        this.settings.showPlatform = document.getElementById('idcard-show-platform').checked;
        this.settings.showRole = document.getElementById('idcard-show-role').checked;

        this.drawCard();
    }

    drawCard() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.cardWidth, this.cardHeight);

        // Background
        ctx.fillStyle = this.settings.background;
        ctx.fillRect(0, 0, this.cardWidth, this.cardHeight);

        // Border effects
        ctx.save();
        if (this.settings.borderStyle === 'glow') {
            ctx.shadowColor = this.settings.accentColor;
            ctx.shadowBlur = 20;
            ctx.strokeStyle = this.settings.accentColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(5, 5, this.cardWidth - 10, this.cardHeight - 10);
            ctx.shadowBlur = 0;
        } else if (this.settings.borderStyle === 'gradient') {
            const grad = ctx.createLinearGradient(0, 0, this.cardWidth, this.cardHeight);
            grad.addColorStop(0, this.settings.accentColor);
            grad.addColorStop(1, '#FFFFFF');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 5;
            ctx.strokeRect(2, 2, this.cardWidth - 4, this.cardHeight - 4);
        } else {
            ctx.strokeStyle = this.settings.accentColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(0, 0, this.cardWidth, this.cardHeight);
        }
        ctx.restore();

        // Logo (simplified text for now)
        if (this.settings.logoPosition !== 'none') {
            ctx.fillStyle = this.settings.accentColor;
            ctx.font = 'bold 24px "Inter", sans-serif';
            ctx.textAlign = 'center';
            const y = this.settings.logoPosition === 'top' ? 50 : this.cardHeight - 50;
            ctx.fillText('⚡ 3UNKS ⚡', this.cardWidth / 2, y);
        }

        // Avatar placeholder
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(100, 150, 50, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '20px "Inter", sans-serif';
        ctx.fillText('Avatar', 75, 160);

        // User info
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px "Inter", sans-serif';
        ctx.fillText(AppState.user.username || 'SURVIVOR', 200, 120);
        if (this.settings.showRole) {
            ctx.font = '18px "Inter", sans-serif';
            ctx.fillStyle = this.settings.accentColor;
            ctx.fillText((AppState.user.role || 'user').toUpperCase(), 200, 160);
        }
        if (this.settings.showPlatform && AppState.user.platform) {
            ctx.font = '16px "Inter", sans-serif';
            ctx.fillStyle = '#aaa';
            const platformText = AppState.user.platform === 'ps5' ? 'PlayStation 5' :
                                 AppState.user.platform === 'xbox' ? 'Xbox Series X|S' : AppState.user.platform;
            ctx.fillText(platformText, 200, 200);
            if (AppState.user.platformId) {
                ctx.fillText(AppState.user.platformId, 200, 230);
            }
        }

        // Footer text
        ctx.font = '12px "Inter", sans-serif';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'right';
        ctx.fillText('The Drained Land\'s', this.cardWidth - 20, this.cardHeight - 20);
    }

    download() {
        // Create a temporary canvas for high-quality download
        const downloadCanvas = document.createElement('canvas');
        downloadCanvas.width = this.cardWidth * 2;
        downloadCanvas.height = this.cardHeight * 2;
        const downloadCtx = downloadCanvas.getContext('2d');
        // Redraw at higher resolution
        // For simplicity, we'll use the preview canvas scaled
        const img = this.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `idcard_${AppState.user.username || 'user'}.png`;
        link.href = img;
        link.click();
    }

    saveSettings() {
        this.saveSettings();
        this.tablet.showToast('ID card settings saved', 'success');
    }

    refresh() {
        this.updatePreview();
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.idCardGenerator = new IDCardGenerator();
});