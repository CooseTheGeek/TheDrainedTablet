// profile.js – DRAINED TABLET ULTIMATE v7.0.0 (Modern social profile page)

class Profile {
    constructor() {
        this.tablet = window.drainedTablet;
        this.db = window.database;
        this.savedServers = this.loadServers();
        this.platforms = ['ps5', 'ps4', 'xbox', 'xboxone'];
        this.cropper = null;
        this.profileData = this.loadProfileData();
        this.init();
    }

    loadServers() {
        const saved = localStorage.getItem('tdl_saved_servers');
        return saved ? JSON.parse(saved) : [];
    }

    saveServers() {
        localStorage.setItem('tdl_saved_servers', JSON.stringify(this.savedServers));
    }

    async loadProfileData() {
        const username = AppState.user?.username || 'default';
        const sessionStr = localStorage.getItem('tdl_session');
        if (sessionStr) {
            try {
                const session = JSON.parse(sessionStr);
                if (session.token) {
                    const res = await fetch('https://drained-bridge.onrender.com/api/user/profile', {
                        headers: { 'Authorization': `Bearer ${session.token}` }
                    });
                    if (res.ok) {
                        const profile = await res.json();
                        return {
                            avatar: profile.avatar_url || window.DEFAULT_AVATAR,
                            cover: localStorage.getItem('tdl_cover_photo') || '',
                            username: profile.username,
                            role: profile.role,
                            platform: profile.platform || '',
                            platformId: profile.platform_id || '',
                            tagline: 'Survivor',
                            joined: new Date().toLocaleDateString(),
                            stats: {
                                kills: 0,
                                deaths: 0,
                                raids: 0,
                                basesBuilt: 0
                            },
                            discordLinked: !!profile.discord_id
                        };
                    }
                }
            } catch(e) { console.warn(e); }
        }
        // Fallback
        return {
            avatar: localStorage.getItem('tdl_avatar') || window.DEFAULT_AVATAR,
            cover: localStorage.getItem('tdl_cover_photo') || '',
            username: username,
            role: AppState.user?.role || 'user',
            platform: localStorage.getItem('tdl_platform') || '',
            platformId: localStorage.getItem('tdl_platform_id') || '',
            tagline: 'Survivor',
            joined: new Date().toLocaleDateString(),
            stats: { kills: 0, deaths: 0, raids: 0, basesBuilt: 0 },
            discordLinked: false
        };
    }

    saveProfileData(data) {
        const username = AppState.user?.username || 'default';
        localStorage.setItem(`tdl_profile_${username}`, JSON.stringify(data));
    }

    async init() {
        this.createHTML();
        this.attachEvents();
        this.updateStats();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'profile') this.refresh();
        });
    }

    async updateStats() {
        if (AppState.connection.status === 'connected') {
            try {
                const kills = await ConnectionManager.executeCommand(`stats.kills ${this.profileData.platformId}`);
                const deaths = await ConnectionManager.executeCommand(`stats.deaths ${this.profileData.platformId}`);
                this.profileData.stats = { kills: parseInt(kills) || 0, deaths: parseInt(deaths) || 0, raids: 0, basesBuilt: 0 };
                this.updateStatsDisplay();
            } catch(e) {}
        }
    }

    updateStatsDisplay() {
        const statsDiv = document.getElementById('profile-stats');
        if (statsDiv) {
            statsDiv.innerHTML = `
                <div class="stat-box"><span class="stat-value">${this.profileData.stats.kills}</span><span class="stat-label">Kills</span></div>
                <div class="stat-box"><span class="stat-value">${this.profileData.stats.deaths}</span><span class="stat-label">Deaths</span></div>
                <div class="stat-box"><span class="stat-value">${this.profileData.stats.raids}</span><span class="stat-label">Raids</span></div>
                <div class="stat-box"><span class="stat-value">${this.profileData.stats.basesBuilt}</span><span class="stat-label">Bases</span></div>
            `;
        }
    }

    createHTML() {
        const tab = document.getElementById('tab-profile');
        if (!tab) return;

        tab.innerHTML = `
            <div class="profile-modern">
                <div class="profile-cover">
                    <img id="profile-cover-img" src="${this.profileData.cover || 'https://via.placeholder.com/1200x300?text=Cover+Image'}" alt="Cover">
                    <button id="change-cover-btn" class="edit-cover-btn">📷 Change Cover</button>
                </div>
                <div class="profile-avatar-container">
                    <div class="profile-avatar" id="profile-avatar-container">
                        <img id="profile-avatar-img" src="${this.profileData.avatar}" alt="Avatar">
                        <button id="change-avatar-btn" class="edit-avatar-btn">✏️</button>
                    </div>
                    <h2 id="profile-display-name">${this.profileData.username}</h2>
                    <div class="profile-role">${this.profileData.role.toUpperCase()}</div>
                    <div class="profile-platform">
                        <span class="platform-badge">${this.profileData.platform.toUpperCase()}</span>
                        <span class="platform-id">${this.profileData.platformId}</span>
                    </div>
                    <div class="profile-tagline">
                        <input type="text" id="profile-tagline-input" value="${this.profileData.tagline}" maxlength="60">
                    </div>
                </div>

                <div class="profile-content">
                    <div class="profile-section">
                        <h3>📊 STATISTICS</h3>
                        <div id="profile-stats" class="stats-grid"></div>
                    </div>

                    <div class="profile-section">
                        <h3>🔗 LINKED ACCOUNTS</h3>
                        <div class="linked-accounts">
                            <div class="account-item">
                                <span>Discord</span>
                                <span id="discord-status">${this.profileData.discordLinked ? '✅ Linked' : '❌ Not linked'}</span>
                                <button id="link-discord-btn" class="small-btn">${this.profileData.discordLinked ? 'Manage' : 'Link'}</button>
                            </div>
                            <div class="account-item">
                                <span>GPortal</span>
                                <span id="gportal-status">Not connected</span>
                                <button id="link-gportal-btn" class="small-btn">Connect</button>
                            </div>
                        </div>
                    </div>

                    <div class="profile-section">
                        <h3>🆔 ID CARD & CUSTOMIZATION</h3>
                        <div class="id-card-preview" id="id-card-preview">
                            <div class="id-card-mini">
                                <div class="id-avatar"><img src="${this.profileData.avatar}" width="40"></div>
                                <div class="id-info">
                                    <strong>${this.profileData.username}</strong>
                                    <span>${this.profileData.platformId}</span>
                                </div>
                            </div>
                        </div>
                        <button id="edit-id-card-btn" class="small-btn">Edit ID Card</button>
                    </div>

                    <div class="profile-section">
                        <h3>⚙️ ACCOUNT SETTINGS</h3>
                        <div class="account-settings">
                            <div class="setting-row">
                                <label>Platform</label>
                                <select id="edit-platform">
                                    <option value="ps5" ${this.profileData.platform === 'ps5' ? 'selected' : ''}>PlayStation 5</option>
                                    <option value="ps4" ${this.profileData.platform === 'ps4' ? 'selected' : ''}>PlayStation 4</option>
                                    <option value="xbox" ${this.profileData.platform === 'xbox' ? 'selected' : ''}>Xbox Series X|S</option>
                                    <option value="xboxone" ${this.profileData.platform === 'xboxone' ? 'selected' : ''}>Xbox One</option>
                                </select>
                            </div>
                            <div class="setting-row">
                                <label>Platform ID</label>
                                <input type="text" id="edit-platform-id" value="${this.profileData.platformId}">
                            </div>
                            <div class="setting-row">
                                <label>Change Password</label>
                                <button id="change-password-btn" class="small-btn">Change Password</button>
                            </div>
                            <div class="setting-row">
                                <label>Delete Account</label>
                                <button id="delete-account-btn" class="small-btn danger">Delete Account</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ID Card Editor Modal -->
            <div id="id-card-modal" class="modal hidden">
                <div class="modal-content">
                    <h3>Customize ID Card</h3>
                    <div class="id-card-editor">
                        <div class="preview-area">
                            <canvas id="id-card-canvas" width="400" height="250"></canvas>
                        </div>
                        <div class="editor-controls">
                            <div class="form-group">
                                <label>Card Background Color</label>
                                <input type="color" id="card-bg-color" value="#1a1a2e">
                            </div>
                            <div class="form-group">
                                <label>Text Color</label>
                                <input type="color" id="card-text-color" value="#e0e0e0">
                            </div>
                            <div class="form-group">
                                <label>Accent Color</label>
                                <input type="color" id="card-accent-color" value="#d4af37">
                            </div>
                            <div class="form-group">
                                <label>Border Style</label>
                                <select id="card-border-style">
                                    <option value="solid">Solid</option>
                                    <option value="glow">Glow</option>
                                    <option value="gradient">Gradient</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Show QR Code</label>
                                <input type="checkbox" id="card-show-qr">
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button id="save-id-card" class="modal-btn primary">Save</button>
                        <button id="download-id-card" class="modal-btn">Download PNG</button>
                        <button id="close-id-card" class="modal-btn">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        this.updateStatsDisplay();
    }

    attachEvents() {
        document.getElementById('change-cover-btn')?.addEventListener('click', () => this.uploadCover());
        document.getElementById('change-avatar-btn')?.addEventListener('click', () => this.uploadAvatar());
        document.getElementById('profile-tagline-input')?.addEventListener('change', (e) => this.saveTagline(e.target.value));
        document.getElementById('edit-id-card-btn')?.addEventListener('click', () => this.openIdCardModal());
        document.getElementById('save-id-card')?.addEventListener('click', () => this.saveIdCard());
        document.getElementById('download-id-card')?.addEventListener('click', () => this.downloadIdCard());
        document.getElementById('close-id-card')?.addEventListener('click', () => {
            document.getElementById('id-card-modal').classList.add('hidden');
        });
        document.getElementById('link-discord-btn')?.addEventListener('click', () => this.linkDiscord());
        document.getElementById('link-gportal-btn')?.addEventListener('click', () => this.linkGPortal());
        document.getElementById('change-password-btn')?.addEventListener('click', () => this.changePassword());
        document.getElementById('delete-account-btn')?.addEventListener('click', () => this.deleteAccount());
        document.getElementById('edit-platform')?.addEventListener('change', (e) => this.savePlatform(e.target.value));
        document.getElementById('edit-platform-id')?.addEventListener('change', (e) => this.savePlatformId(e.target.value));
    }

    uploadCover() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                const coverImg = document.getElementById('profile-cover-img');
                coverImg.src = ev.target.result;
                localStorage.setItem('tdl_cover_photo', ev.target.result);
                toast.success('Cover photo updated');
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    uploadAvatar() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                this.showCropModal(ev.target.result);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    }

    showCropModal(imageSrc) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Crop Avatar</h3>
                <img id="crop-image" src="${imageSrc}" style="max-width: 100%;">
                <div class="modal-actions">
                    <button id="crop-confirm" class="modal-btn primary">Crop & Save</button>
                    <button id="crop-cancel" class="modal-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.classList.remove('hidden');

        const img = document.getElementById('crop-image');
        let cropper = new Cropper(img, { aspectRatio: 1, viewMode: 1 });

        document.getElementById('crop-confirm').onclick = () => {
            const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });
            const cropped = canvas.toDataURL();
            document.getElementById('profile-avatar-img').src = cropped;
            localStorage.setItem('tdl_avatar', cropped);
            toast.success('Avatar updated');
            cropper.destroy();
            modal.remove();
        };
        document.getElementById('crop-cancel').onclick = () => {
            cropper.destroy();
            modal.remove();
        };
    }

    saveTagline(value) {
        this.profileData.tagline = value;
        this.saveProfileData(this.profileData);
        toast.success('Tagline updated');
    }

    savePlatform(platform) {
        this.profileData.platform = platform;
        localStorage.setItem('tdl_platform', platform);
        this.saveProfileData(this.profileData);
        toast.success('Platform updated');
    }

    savePlatformId(platformId) {
        this.profileData.platformId = platformId;
        localStorage.setItem('tdl_platform_id', platformId);
        this.saveProfileData(this.profileData);
        toast.success('Platform ID updated');
    }

    openIdCardModal() {
        this.drawIdCardPreview();
        document.getElementById('id-card-modal').classList.remove('hidden');
        document.getElementById('card-bg-color').addEventListener('input', () => this.drawIdCardPreview());
        document.getElementById('card-text-color').addEventListener('input', () => this.drawIdCardPreview());
        document.getElementById('card-accent-color').addEventListener('input', () => this.drawIdCardPreview());
        document.getElementById('card-border-style').addEventListener('change', () => this.drawIdCardPreview());
        document.getElementById('card-show-qr').addEventListener('change', () => this.drawIdCardPreview());
    }

    drawIdCardPreview() {
        const canvas = document.getElementById('id-card-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = 400, h = 250;
        canvas.width = w;
        canvas.height = h;

        const bgColor = document.getElementById('card-bg-color').value;
        const textColor = document.getElementById('card-text-color').value;
        const accentColor = document.getElementById('card-accent-color').value;
        const borderStyle = document.getElementById('card-border-style').value;
        const showQR = document.getElementById('card-show-qr').checked;

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);

        if (borderStyle === 'solid') {
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(5, 5, w - 10, h - 10);
        } else if (borderStyle === 'glow') {
            ctx.shadowColor = accentColor;
            ctx.shadowBlur = 10;
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(5, 5, w - 10, h - 10);
            ctx.shadowBlur = 0;
        } else if (borderStyle === 'gradient') {
            const grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, accentColor);
            grad.addColorStop(1, '#ffffff');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 4;
            ctx.strokeRect(5, 5, w - 10, h - 10);
        }

        // Avatar
        const avatar = document.getElementById('profile-avatar-img').src;
        const avatarImg = new Image();
        avatarImg.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(60, 75, 35, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatarImg, 25, 40, 70, 70);
            ctx.restore();
            ctx.beginPath();
            ctx.arc(60, 75, 35, 0, 2 * Math.PI);
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 2;
            ctx.stroke();
        };
        avatarImg.src = avatar;

        // Text
        ctx.fillStyle = textColor;
        ctx.font = 'bold 20px Inter';
        ctx.fillText(this.profileData.username, 120, 70);
        ctx.font = '14px Inter';
        ctx.fillStyle = accentColor;
        ctx.fillText(this.profileData.role.toUpperCase(), 120, 95);
        ctx.fillStyle = textColor;
        ctx.font = '12px Inter';
        ctx.fillText(this.profileData.platformId, 120, 115);
        ctx.fillText(this.profileData.tagline, 120, 140);

        // QR code placeholder
        if (showQR) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(w - 70, h - 70, 50, 50);
            ctx.fillStyle = '#000';
            ctx.font = '10px monospace';
            ctx.fillText('QR', w - 50, h - 45);
        }

        // Logo
        ctx.fillStyle = accentColor;
        ctx.font = 'italic 12px Inter';
        ctx.fillText('⚡ THE DRAINED LAND\'S', w - 130, h - 10);
    }

    saveIdCard() {
        // Save settings to localStorage for next time
        const settings = {
            bgColor: document.getElementById('card-bg-color').value,
            textColor: document.getElementById('card-text-color').value,
            accentColor: document.getElementById('card-accent-color').value,
            borderStyle: document.getElementById('card-border-style').value,
            showQR: document.getElementById('card-show-qr').checked
        };
        localStorage.setItem('tdl_id_card_settings', JSON.stringify(settings));
        toast.success('ID card settings saved');
        document.getElementById('id-card-modal').classList.add('hidden');
    }

    downloadIdCard() {
        const canvas = document.getElementById('id-card-canvas');
        const link = document.createElement('a');
        link.download = `idcard_${this.profileData.username}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }

    linkDiscord() {
        window.location.href = 'https://drained-bridge.onrender.com/api/discord/login';
    }

    linkGPortal() {
        window.switchTab('gportal');
        toast.info('Please set up GPortal connection in the GPortal tab');
    }

    changePassword() {
        const newPass = prompt('Enter new password (min 6 characters):');
        if (!newPass || newPass.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        // Call API to update password
        fetch('https://drained-bridge.onrender.com/api/user/password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('tdl_session')).token}` },
            body: JSON.stringify({ password: newPass })
        }).then(res => {
            if (res.ok) toast.success('Password changed');
            else toast.error('Failed to change password');
        }).catch(() => toast.error('API unreachable, password not changed'));
    }

    deleteAccount() {
        if (!confirm('⚠️ PERMANENTLY DELETE YOUR ACCOUNT? All data will be lost.')) return;
        fetch('https://drained-bridge.onrender.com/api/user/delete', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${JSON.parse(localStorage.getItem('tdl_session')).token}` }
        }).then(() => {
            localStorage.clear();
            location.reload();
        }).catch(() => {
            localStorage.clear();
            location.reload();
        });
    }

    refresh() {
        this.createHTML();
        this.attachEvents();
        this.updateStats();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.profile = new Profile();
});