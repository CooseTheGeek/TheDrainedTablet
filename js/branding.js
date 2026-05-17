// branding.js – DRAINED TABLET v7.0.0 (Server branding with live preview and image upload)

class Branding {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.branding = this.loadBranding();
        this.previewActive = false;
        this.init();
    }

    loadBranding() {
        const saved = localStorage.getItem('tdl_branding');
        const user = AppState.user.username || 'default';
        const userBranding = saved ? JSON.parse(saved)[user] : null;
        return userBranding || {
            serverName: 'The Drained Land\'s 2X Monthly',
            serverImage: null,
            discord: 'discord.gg/drained',
            logo: '⚡',
            colors: {
                primary: '#D4AF37',
                secondary: '#2A6230'
            }
        };
    }

    saveBranding() {
        const saved = localStorage.getItem('tdl_branding') || '{}';
        const allBranding = JSON.parse(saved);
        allBranding[AppState.user.username || 'default'] = this.branding;
        localStorage.setItem('tdl_branding', JSON.stringify(allBranding));
    }

    init() {
        this.ensureServerNameElement();
        this.createHTML();
        this.attachEvents();
        this.applyBranding();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'branding') {
                this.refresh();
            }
        });
    }

    ensureServerNameElement() {
        if (!document.getElementById('server-name-display')) {
            const el = document.createElement('span');
            el.id = 'server-name-display';
            el.style.display = 'none';
            document.body.appendChild(el);
        }
    }

    createHTML() {
        const tab = document.getElementById('tab-branding');
        if (!tab) return;

        tab.innerHTML = `
            <div class="branding-container">
                <div class="branding-header">
                    <h2>🏷️ SERVER BRANDING</h2>
                    <p>Customize how your server appears in the dashboard</p>
                </div>

                <div class="branding-grid">
                    <div class="branding-section">
                        <h3>SERVER IDENTITY</h3>
                        <div class="form-group">
                            <label>Server Name:</label>
                            <input type="text" id="server-name" value="${this.branding.serverName}">
                        </div>
                        <div class="form-group">
                            <label>Discord Invite:</label>
                            <input type="text" id="discord-link" value="${this.branding.discord}">
                        </div>
                        <div class="form-group">
                            <label>Logo Symbol:</label>
                            <input type="text" id="logo-symbol" value="${this.branding.logo}" maxlength="2">
                        </div>
                        <div class="color-picker-group">
                            <label>Primary Color:</label>
                            <input type="color" id="primary-color" value="${this.branding.colors.primary}">
                        </div>
                        <div class="color-picker-group">
                            <label>Secondary Color:</label>
                            <input type="color" id="secondary-color" value="${this.branding.colors.secondary}">
                        </div>
                    </div>

                    <div class="branding-section">
                        <h3>SERVER IMAGE</h3>
                        <div class="image-preview" id="image-preview">
                            ${this.branding.serverImage ? 
                                `<img src="${this.branding.serverImage}" style="max-width: 100%; max-height: 200px;">` : 
                                '<div class="no-image">No image uploaded</div>'}
                        </div>
                        <div class="image-controls">
                            <button id="upload-image" class="branding-btn">📤 UPLOAD IMAGE</button>
                            <button id="remove-image" class="branding-btn">🗑️ REMOVE</button>
                        </div>
                        <p class="hint">Recommended size: 1920x1080 (PNG, JPG, GIF)</p>
                    </div>

                    <div class="branding-section preview-section">
                        <h3>LIVE PREVIEW</h3>
                        <div class="preview-card" id="branding-preview">
                            <div class="preview-header" style="background: ${this.branding.colors.primary}20">
                                <span class="preview-logo">${this.branding.logo}</span>
                                <span class="preview-name">${this.branding.serverName}</span>
                            </div>
                            <div class="preview-content">
                                ${this.branding.serverImage ? 
                                    `<img src="${this.branding.serverImage}" class="preview-image">` : 
                                    '<div class="preview-placeholder">SERVER IMAGE</div>'}
                            </div>
                            <div class="preview-footer" style="color: ${this.branding.colors.secondary}">
                                ${this.branding.discord}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="branding-actions">
                    <button id="save-branding" class="branding-btn primary">💾 SAVE BRANDING</button>
                    <button id="reset-branding" class="branding-btn">🔄 RESET TO DEFAULT</button>
                    <button id="preview-branding" class="branding-btn">👁️ APPLY PREVIEW</button>
                </div>

                <div class="user-session-info">
                    <h3>SESSION INFO</h3>
                    <p>These settings are saved for user: <strong>${AppState.user.username || 'Not signed in'}</strong></p>
                    <p>Each user sees their own custom branding.</p>
                </div>
            </div>
        `;

        this.updatePreview();
    }

    attachEvents() {
        document.getElementById('upload-image')?.addEventListener('click', () => this.uploadImage());
        document.getElementById('remove-image')?.addEventListener('click', () => this.removeImage());
        document.getElementById('save-branding')?.addEventListener('click', () => this.saveBranding());
        document.getElementById('reset-branding')?.addEventListener('click', () => this.resetBranding());
        document.getElementById('preview-branding')?.addEventListener('click', () => this.applyPreview());

        // Live preview on input
        document.getElementById('server-name')?.addEventListener('input', () => this.updatePreview());
        document.getElementById('discord-link')?.addEventListener('input', () => this.updatePreview());
        document.getElementById('logo-symbol')?.addEventListener('input', () => this.updatePreview());
        document.getElementById('primary-color')?.addEventListener('input', () => this.updatePreview());
        document.getElementById('secondary-color')?.addEventListener('input', () => this.updatePreview());
    }

    uploadImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.branding.serverImage = event.target.result;
                    this.updatePreview();
                    this.updateImageDisplay();
                    this.tablet.showToast('Image uploaded', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }

    removeImage() {
        this.branding.serverImage = null;
        this.updatePreview();
        this.updateImageDisplay();
        this.tablet.showToast('Image removed', 'info');
    }

    updateImageDisplay() {
        const preview = document.getElementById('image-preview');
        if (!preview) return;
        if (this.branding.serverImage) {
            preview.innerHTML = `<img src="${this.branding.serverImage}" style="max-width: 100%; max-height: 200px;">`;
        } else {
            preview.innerHTML = '<div class="no-image">No image uploaded</div>';
        }
    }

    updatePreview() {
        const name = document.getElementById('server-name')?.value;
        const discord = document.getElementById('discord-link')?.value;
        const logo = document.getElementById('logo-symbol')?.value;
        const primary = document.getElementById('primary-color')?.value;
        const secondary = document.getElementById('secondary-color')?.value;

        const preview = document.getElementById('branding-preview');
        if (!preview) return;

        const header = preview.querySelector('.preview-header');
        const logoEl = preview.querySelector('.preview-logo');
        const nameEl = preview.querySelector('.preview-name');
        const footer = preview.querySelector('.preview-footer');

        if (header && primary) header.style.background = primary + '20';
        if (logoEl && logo) logoEl.innerText = logo;
        if (nameEl && name) nameEl.innerText = name;
        if (footer && secondary) footer.style.color = secondary;
        if (footer && discord) footer.innerText = discord;
    }

    applyPreview() {
        this.previewActive = true;
        this.updatePreview();
        const displayEl = document.getElementById('server-name-display');
        if (displayEl) {
            displayEl.innerText = document.getElementById('server-name')?.value || this.branding.serverName;
        }
        this.tablet.showToast('Preview applied', 'success');
    }

    applyBranding() {
        const displayEl = document.getElementById('server-name-display');
        if (displayEl) displayEl.innerText = this.branding.serverName;
        document.documentElement.style.setProperty('--accent-primary', this.branding.colors.primary);
        document.documentElement.style.setProperty('--accent-secondary', this.branding.colors.secondary);
        const discordEl = document.querySelector('.discord-link');
        if (discordEl) discordEl.innerText = this.branding.discord;
    }

    saveBranding() {
        this.branding = {
            serverName: document.getElementById('server-name')?.value || this.branding.serverName,
            discord: document.getElementById('discord-link')?.value || this.branding.discord,
            logo: document.getElementById('logo-symbol')?.value || this.branding.logo,
            colors: {
                primary: document.getElementById('primary-color')?.value || this.branding.colors.primary,
                secondary: document.getElementById('secondary-color')?.value || this.branding.colors.secondary
            },
            serverImage: this.branding.serverImage
        };
        this.saveBranding();
        this.applyBranding();
        this.tablet.showToast('Branding saved for ' + (AppState.user.username || 'default'), 'success');
    }

    resetBranding() {
        if (!confirm('Reset to default branding?')) return;
        this.branding = {
            serverName: 'The Drained Land\'s 2X Monthly',
            serverImage: null,
            discord: 'discord.gg/drained',
            logo: '⚡',
            colors: {
                primary: '#D4AF37',
                secondary: '#2A6230'
            }
        };
        document.getElementById('server-name').value = this.branding.serverName;
        document.getElementById('discord-link').value = this.branding.discord;
        document.getElementById('logo-symbol').value = this.branding.logo;
        document.getElementById('primary-color').value = this.branding.colors.primary;
        document.getElementById('secondary-color').value = this.branding.colors.secondary;
        this.updatePreview();
        this.updateImageDisplay();
        this.tablet.showToast('Branding reset', 'info');
    }

    refresh() {
        this.updatePreview();
        this.updateImageDisplay();
        this.tablet.showToast('Branding refreshed', 'success');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.branding = new Branding();
});