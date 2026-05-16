// profile.js – DRAINED TABLET v7.0.0 (Merged Profile & ID Card, social style)

class Profile {
    constructor() {
        this.tablet = window.drainedTablet;
        this.db = window.database;
        this.cropper = null;
        this.avatarPresets = this.generateAvatarPresets();
        this.profileData = this.loadProfileData();
        this.init();
    }

    generateAvatarPresets() {
        const presets = [];
        // Generate 100 unique avatar placeholders (emoji-based for simplicity)
        const emojis = ['😀','😎','🦊','🐺','🐻','🐼','🐨','🦁','🐸','🐙','🦅','🐉','🧙','🧝','🧟','🧛','🤖','👽','💀','🎃','🔥','⚡','🌲','🪓','🔫','🛡️','🏹','⚔️','🔧','🏗️','🚗','🚁','🚤','🏍️','🏠','🏕️','🏪','💰','📦','👑','🎮','📊','🗺️','📚','⚙️','🔒','🔓','💡','🔋','🧪','🧬','🩸','🧲','🔩','🪚','🪛','🪢','🪤','🪣','🪥','🪦','🪧','🪨','🪵','🪶','🪷','🪸','🪹','🪺','🪻','🪼','🪽','🪿','🫀','🫁','🫂','🫃','🫄','🫅','🫎','🫏','🫐','🫑','🫒','🫓','🫔','🫕','🫖','🫗','🫘','🫙','🫚','🫛','🫜','🫝','🫞','🫟'];
        for (let i = 0; i < 100; i++) {
            presets.push({
                id: i,
                name: `Avatar ${i+1}`,
                url: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23${Math.floor(Math.random()*16777215).toString(16)}'/%3E%3Ctext x='50' y='67' font-size='40' text-anchor='middle' fill='white'%3E${emojis[i % emojis.length]}%3C/text%3E%3C/svg%3E`
            });
        }
        return presets;
    }

    loadProfileData() {
        const saved = localStorage.getItem('tdl_profile_data');
        if (saved) return JSON.parse(saved);
        return {
            avatar: localStorage.getItem('tdl_avatar') || this.avatarPresets[0].url,
            cover: localStorage.getItem('tdl_cover_photo') || '',
            username: AppState.user?.username || 'Survivor',
            role: AppState.user?.role || 'user',
            platform: localStorage.getItem('tdl_platform') || 'ps5',
            platformId: localStorage.getItem('tdl_platform_id') || '',
            bio: 'Rust survivor. Builder. Raider.',
            serverName: 'The Drained Land\'s 2X',
            tagline: '⚡ 3UNKS ⚡',
            joined: new Date().toLocaleDateString(),
            discordLinked: false,
            selectedAvatarPreset: 0
        };
    }

    saveProfileData() {
        localStorage.setItem('tdl_profile_data', JSON.stringify(this.profileData));
        localStorage.setItem('tdl_avatar', this.profileData.avatar);
        localStorage.setItem('tdl_platform', this.profileData.platform);
        localStorage.setItem('tdl_platform_id', this.profileData.platformId);
        if (window.sidebarManager) window.sidebarManager.updateSidebarUserInfo();
        window.dispatchEvent(new CustomEvent('profile-updated'));
        toast.success('Profile saved');
    }

    async init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'profile') this.refresh();
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-profile');
        if (!tab) return;

        tab.innerHTML = `
            <div class="profile-modern">
                <!-- Cover Photo -->
                <div class="profile-cover">
                    <img id="profile-cover-img" src="${this.profileData.cover || 'https://via.placeholder.com/1200x300?text=Cover+Image'}" alt="Cover">
                    <button id="change-cover-btn" class="edit-cover-btn">📷 Change Cover</button>
                </div>

                <!-- Avatar & Basic Info -->
                <div class="profile-avatar-container">
                    <div class="profile-avatar" id="profile-avatar-container">
                        <img id="profile-avatar-img" src="${this.profileData.avatar}" alt="Avatar">
                        <button id="change-avatar-btn" class="edit-avatar-btn">✏️</button>
                    </div>
                    <h2 id="profile-display-name">${this.profileData.username}</h2>
                    <div class="profile-role">${this.profileData.role.toUpperCase()}</div>
                    <div class="profile-platform">
                        <select id="profile-platform-select" class="platform-select">
                            <option value="ps5" ${this.profileData.platform === 'ps5' ? 'selected' : ''}>PlayStation 5</option>
                            <option value="ps4" ${this.profileData.platform === 'ps4' ? 'selected' : ''}>PlayStation 4</option>
                            <option value="xbox" ${this.profileData.platform === 'xbox' ? 'selected' : ''}>Xbox Series X|S</option>
                            <option value="xboxone" ${this.profileData.platform === 'xboxone' ? 'selected' : ''}>Xbox One</option>
                        </select>
                        <input type="text" id="profile-platform-id" class="platform-id-input" value="${this.profileData.platformId}" placeholder="Gamertag / PSN ID">
                    </div>
                    <div class="profile-bio">
                        <textarea id="profile-bio" rows="2" placeholder="Write a bio...">${this.profileData.bio}</textarea>
                    </div>
                    <div class="profile-tagline">
                        <input type="text" id="profile-tagline" value="${this.profileData.tagline}" maxlength="30" placeholder="Tagline">
                    </div>
                </div>

                <!-- Stats Row -->
                <div class="profile-stats-row" id="profile-stats-row">
                    <div class="stat-item"><span class="stat-value" id="stat-kills">0</span><span class="stat-label">Kills</span></div>
                    <div class="stat-item"><span class="stat-value" id="stat-deaths">0</span><span class="stat-label">Deaths</span></div>
                    <div class="stat-item"><span class="stat-value" id="stat-raids">0</span><span class="stat-label">Raids</span></div>
                    <div class="stat-item"><span class="stat-value" id="stat-bases">0</span><span class="stat-label">Bases</span></div>
                </div>

                <!-- Two Column Layout -->
                <div class="profile-two-col">
                    <!-- Left Column: About & Links -->
                    <div class="profile-left">
                        <div class="profile-card">
                            <h3>📋 About</h3>
                            <div class="about-item"><strong>Server:</strong> <span id="profile-server-name">${this.profileData.serverName}</span></div>
                            <div class="about-item"><strong>Joined:</strong> ${this.profileData.joined}</div>
                            <div class="about-item"><strong>Discord:</strong> <span id="discord-link-status">${this.profileData.discordLinked ? '✅ Linked' : '❌ Not linked'}</span></div>
                            <button id="link-discord-btn" class="small-btn">${this.profileData.discordLinked ? 'Manage' : 'Link Discord'}</button>
                        </div>
                        <div class="profile-card">
                            <h3>🪪 ID Card Preview</h3>
                            <div class="id-card-mini" id="id-card-mini">
                                <div class="id-avatar"><img src="${this.profileData.avatar}" width="40"></div>
                                <div class="id-info">
                                    <strong>${this.profileData.username}</strong>
                                    <span>${this.profileData.platformId}</span>
                                </div>
                            </div>
                            <button id="edit-id-card-btn" class="small-btn">Customize ID Card</button>
                        </div>
                    </div>

                    <!-- Right Column: Settings & Actions -->
                    <div class="profile-right">
                        <div class="profile-card">
                            <h3>⚙️ Account Settings</h3>
                            <button id="change-password-btn" class="profile-action-btn">🔐 Change Password</button>
                            <button id="delete-account-btn" class="profile-action-btn danger">🗑️ Delete Account</button>
                        </div>
                        <div class="profile-card">
                            <h3>🎨 Avatar Gallery</h3>
                            <div class="avatar-gallery" id="avatar-gallery"></div>
                            <button id="upload-custom-avatar" class="small-btn">📤 Upload Custom Avatar</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ID Card Editor Modal -->
            <div id="id-card-modal" class="modal hidden">
                <div class="modal-content" style="max-width: 700px;">
                    <h3>Customize ID Card</h3>
                    <div class="id-card-editor">
                        <div class="preview-area">
                            <canvas id="id-card-canvas" width="400" height="250"></canvas>
                        </div>
                        <div class="editor-controls">
                            <div class="form-group"><label>Background Color</label><input type="color" id="card-bg-color" value="#1a1a2e"></div>
                            <div class="form-group"><label>Text Color</label><input type="color" id="card-text-color" value="#e0e0e0"></div>
                            <div class="form-group"><label>Accent Color</label><input type="color" id="card-accent-color" value="#d4af37"></div>
                            <div class="form-group"><label>Border Style</label><select id="card-border-style"><option value="solid">Solid</option><option value="glow">Glow</option><option value="gradient">Gradient</option></select></div>
                            <div class="form-group"><label>Show QR Code</label><input type="checkbox" id="card-show-qr"></div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button id="save-id-card" class="modal-btn primary">Save</button>
                        <button id="download-id-card" class="modal-btn">Download PNG</button>
                        <button id="close-id-card" class="modal-btn">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- Crop Avatar Modal -->
            <div id="crop-avatar-modal" class="modal hidden">
                <div class="modal-content">
                    <h3>Crop Avatar</h3>
                    <img id="crop-image" style="max-width: 100%;">
                    <div class="modal-actions">
                        <button id="crop-confirm" class="modal-btn primary">Crop & Save</button>
                        <button id="crop-cancel" class="modal-btn">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        this.renderAvatarGallery();
        this.updateStats();
    }

    renderAvatarGallery() {
        const gallery = document.getElementById('avatar-gallery');
        if (!gallery) return;
        let html = '';
        for (let i = 0; i < Math.min(20, this.avatarPresets.length); i++) {
            const preset = this.avatarPresets[i];
            html += `<img src="${preset.url}" class="avatar-preset" data-url="${preset.url}" style="width: 50px; height: 50px; border-radius: 50%; cursor: pointer; margin: 4px; border: 2px solid ${this.profileData.avatar === preset.url ? 'var(--accent-primary)' : 'transparent'};">`;
        }
        gallery.innerHTML = html;
        gallery.querySelectorAll('.avatar-preset').forEach(img => {
            img.addEventListener('click', () => {
                this.profileData.avatar = img.dataset.url;
                document.getElementById('profile-avatar-img').src = this.profileData.avatar;
                this.saveProfileData();
                this.renderAvatarGallery();
            });
        });
    }

    async updateStats() {
        if (AppState.connection.status === 'connected' && this.profileData.platformId) {
            try {
                const kills = await ConnectionManager.executeCommand(`stats.kills ${this.profileData.platformId}`);
                const deaths = await ConnectionManager.executeCommand(`stats.deaths ${this.profileData.platformId}`);
                document.getElementById('stat-kills').innerText = kills || 0;
                document.getElementById('stat-deaths').innerText = deaths || 0;
            } catch(e) {}
        }
    }

    attachEvents() {
        document.getElementById('change-cover-btn')?.addEventListener('click', () => this.uploadCover());
        document.getElementById('change-avatar-btn')?.addEventListener('click', () => this.uploadAvatar());
        document.getElementById('profile-platform-select')?.addEventListener('change', (e) => { this.profileData.platform = e.target.value; this.saveProfileData(); });
        document.getElementById('profile-platform-id')?.addEventListener('change', (e) => { this.profileData.platformId = e.target.value; this.saveProfileData(); });
        document.getElementById('profile-bio')?.addEventListener('change', (e) => { this.profileData.bio = e.target.value; this.saveProfileData(); });
        document.getElementById('profile-tagline')?.addEventListener('change', (e) => { this.profileData.tagline = e.target.value; this.saveProfileData(); });
        document.getElementById('link-discord-btn')?.addEventListener('click', () => this.linkDiscord());
        document.getElementById('edit-id-card-btn')?.addEventListener('click', () => this.openIdCardModal());
        document.getElementById('change-password-btn')?.addEventListener('click', () => this.changePassword());
        document.getElementById('delete-account-btn')?.addEventListener('click', () => this.deleteAccount());
        document.getElementById('upload-custom-avatar')?.addEventListener('click', () => this.uploadCustomAvatar());
        document.getElementById('save-id-card')?.addEventListener('click', () => this.saveIdCard());
        document.getElementById('download-id-card')?.addEventListener('click', () => this.downloadIdCard());
        document.getElementById('close-id-card')?.addEventListener('click', () => document.getElementById('id-card-modal').classList.add('hidden'));
        document.getElementById('crop-confirm')?.addEventListener('click', () => this.confirmCrop());
        document.getElementById('crop-cancel')?.addEventListener('click', () => document.getElementById('crop-avatar-modal').classList.add('hidden'));
    }

    uploadCover() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                this.profileData.cover = ev.target.result;
                document.getElementById('profile-cover-img').src = ev.target.result;
                this.saveProfileData();
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

    uploadCustomAvatar() {
        this.uploadAvatar();
    }

    showCropModal(imageSrc) {
        const modal = document.getElementById('crop-avatar-modal');
        const img = document.getElementById('crop-image');
        img.src = imageSrc;
        modal.classList.remove('hidden');
        img.onload = () => {
            if (this.cropper) this.cropper.destroy();
            this.cropper = new Cropper(img, { aspectRatio: 1, viewMode: 1 });
        };
    }

    confirmCrop() {
        if (!this.cropper) return;
        const canvas = this.cropper.getCroppedCanvas({ width: 300, height: 300 });
        const cropped = canvas.toDataURL();
        this.profileData.avatar = cropped;
        document.getElementById('profile-avatar-img').src = cropped;
        this.saveProfileData();
        this.renderAvatarGallery();
        this.cropper.destroy();
        document.getElementById('crop-avatar-modal').classList.add('hidden');
        toast.success('Avatar updated');
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
        canvas.width = w; canvas.height = h;
        const bg = document.getElementById('card-bg-color').value;
        const textColor = document.getElementById('card-text-color').value;
        const accent = document.getElementById('card-accent-color').value;
        const borderStyle = document.getElementById('card-border-style').value;
        const showQR = document.getElementById('card-show-qr').checked;
        ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
        if (borderStyle === 'solid') { ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.strokeRect(5,5,w-10,h-10); }
        else if (borderStyle === 'glow') { ctx.shadowColor = accent; ctx.shadowBlur = 10; ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.strokeRect(5,5,w-10,h-10); ctx.shadowBlur = 0; }
        else if (borderStyle === 'gradient') { const grad = ctx.createLinearGradient(0,0,w,h); grad.addColorStop(0,accent); grad.addColorStop(1,'#fff'); ctx.strokeStyle = grad; ctx.lineWidth = 4; ctx.strokeRect(5,5,w-10,h-10); }
        const avatar = new Image(); avatar.src = this.profileData.avatar; avatar.onload = () => { ctx.save(); ctx.beginPath(); ctx.arc(60,75,35,0,2*Math.PI); ctx.closePath(); ctx.clip(); ctx.drawImage(avatar,25,40,70,70); ctx.restore(); ctx.beginPath(); ctx.arc(60,75,35,0,2*Math.PI); ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.stroke(); };
        ctx.fillStyle = textColor; ctx.font = 'bold 20px Inter'; ctx.fillText(this.profileData.username,120,70);
        ctx.font = '14px Inter'; ctx.fillStyle = accent; ctx.fillText(this.profileData.role.toUpperCase(),120,95);
        ctx.fillStyle = textColor; ctx.font = '12px Inter'; ctx.fillText(this.profileData.platformId,120,115); ctx.fillText(this.profileData.tagline,120,140);
        if (showQR) { ctx.fillStyle = '#fff'; ctx.fillRect(w-70,h-70,50,50); ctx.fillStyle = '#000'; ctx.font = '10px monospace'; ctx.fillText('QR',w-50,h-45); }
        ctx.fillStyle = accent; ctx.font = 'italic 12px Inter'; ctx.fillText('⚡ 3UNKS',w-100,h-10);
    }

    saveIdCard() {
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

    linkDiscord() { window.location.href = 'https://drained-bridge.onrender.com/api/discord/login'; }
    changePassword() { toast.info('Password change not implemented in demo'); }
    deleteAccount() { if(confirm('Permanently delete your account?')){ localStorage.clear(); location.reload(); } }

    refresh() {
        this.profileData = this.loadProfileData();
        this.createHTML();
        this.attachEvents();
        this.updateStats();
    }
}

document.addEventListener('DOMContentLoaded', () => { window.profile = new Profile(); });