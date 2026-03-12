// user-management.js – DRAINED TABLET ULTIMATE v7.0.0
// User administration with 2FA enrollment.

class UserManagement {
    constructor() {
        this.tablet = window.drainedTablet;
        this.auth = window.authSystem;
        this.access = window.accessControl;
        this.users = this.auth.loadUsers();
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'user-management') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-user-management');
        if (!tab) return;

        if (!this.access.isMaster()) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="user-mgmt-container">
                <div class="user-mgmt-header">
                    <h2>👥 USER MANAGEMENT</h2>
                    <div class="user-mgmt-actions">
                        <button id="refresh-users" class="user-btn">🔄 REFRESH</button>
                    </div>
                </div>

                <div class="user-mgmt-grid">
                    <div class="user-list-section">
                        <h3>EXISTING USERS</h3>
                        <div id="user-list" class="user-list"></div>
                    </div>

                    <div class="add-user-section">
                        <h3>➕ ADD NEW USER</h3>
                        <div class="form-group">
                            <label>Username:</label>
                            <input type="text" id="new-username" placeholder="Username">
                        </div>
                        <div class="form-group">
                            <label>4‑digit code:</label>
                            <input type="text" id="new-code" placeholder="1234" maxlength="4">
                        </div>
                        <div class="form-group">
                            <label>Role:</label>
                            <select id="new-role">
                                <option value="user">User</option>
                                <option value="master">Master</option>
                                <option value="owner">Owner</option>
                            </select>
                        </div>
                        <button id="add-user" class="user-btn primary">➕ ADD USER</button>
                    </div>
                </div>

                <!-- 2FA Setup Modal -->
                <div id="totp-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3>🔐 2FA SETUP FOR <span id="totp-username"></span></h3>
                        <p>Scan this QR code with Google Authenticator:</p>
                        <div id="totp-qr" class="qr-placeholder"></div>
                        <p>Or enter this secret manually:</p>
                        <div id="totp-secret" class="totp-secret"></div>
                        <p>After scanning, enter the 6‑digit code to verify:</p>
                        <div class="form-group">
                            <input type="text" id="totp-verify" placeholder="123456" maxlength="6">
                        </div>
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="totp-trust-device"> Trust this device
                            </label>
                        </div>
                        <div class="modal-actions">
                            <button id="verify-totp" class="user-btn primary">VERIFY & ENABLE</button>
                            <button id="cancel-totp" class="user-btn">CANCEL</button>
                        </div>
                    </div>
                </div>

                <!-- Disable 2FA Confirmation Modal (optional) -->
                <div id="disable-2fa-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3>Disable 2FA</h3>
                        <p>Are you sure you want to disable 2FA for <span id="disable-username"></span>?</p>
                        <div class="modal-actions">
                            <button id="confirm-disable" class="user-btn warning">DISABLE</button>
                            <button id="cancel-disable" class="user-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderUserList();
    }

    attachEvents() {
        document.getElementById('refresh-users')?.addEventListener('click', () => this.refresh());
        document.getElementById('add-user')?.addEventListener('click', () => this.addUser());
        document.getElementById('cancel-totp')?.addEventListener('click', () => {
            document.getElementById('totp-modal').classList.add('hidden');
        });
        document.getElementById('verify-totp')?.addEventListener('click', () => this.verifyTotp());
        document.getElementById('cancel-disable')?.addEventListener('click', () => {
            document.getElementById('disable-2fa-modal').classList.add('hidden');
        });
        document.getElementById('confirm-disable')?.addEventListener('click', () => this.disable2FA());

        // Delegate for user actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-user')) {
                const user = e.target.dataset.user;
                this.deleteUser(user);
            }
            if (e.target.classList.contains('enable-totp')) {
                const user = e.target.dataset.user;
                this.enableTotp(user);
            }
            if (e.target.classList.contains('disable-totp')) {
                const user = e.target.dataset.user;
                this.promptDisable(user);
            }
            if (e.target.classList.contains('edit-user')) {
                const user = e.target.dataset.user;
                this.editUser(user);
            }
        });
    }

    renderUserList() {
        const listDiv = document.getElementById('user-list');
        if (!listDiv) return;
        this.users = this.auth.loadUsers(); // reload
        if (Object.keys(this.users).length === 0) {
            listDiv.innerHTML = '<div class="no-users">No users found</div>';
            return;
        }
        let html = '<table class="user-table"><tr><th>Username</th><th>Role</th><th>2FA</th><th>Actions</th></tr>';
        for (let [username, data] of Object.entries(this.users)) {
            html += `
                <tr>
                    <td>${username}</td>
                    <td>${data.role}</td>
                    <td>${data.totpEnabled ? '✅' : '❌'}</td>
                    <td>
                        <button class="small-btn edit-user" data-user="${username}">✏️</button>
                        <button class="small-btn delete-user" data-user="${username}" ${username === 'CooseTheGeek' ? 'disabled' : ''}>🗑️</button>
                        ${!data.totpEnabled ? 
                            `<button class="small-btn enable-totp" data-user="${username}">🔐 Enable 2FA</button>` : 
                            `<button class="small-btn disable-totp" data-user="${username}">🔓 Disable 2FA</button>`}
                    </td>
                </tr>
            `;
        }
        html += '</table>';
        listDiv.innerHTML = html;
    }

    addUser() {
        if (!this.access.isMaster()) {
            toast.error('Master access required');
            return;
        }
        const username = document.getElementById('new-username').value.trim();
        const code = document.getElementById('new-code').value.trim();
        const role = document.getElementById('new-role').value;

        if (!username || !code) {
            toast.error('Username and code required');
            return;
        }
        if (code.length !== 4 || !/^\d+$/.test(code)) {
            toast.error('Code must be 4 digits');
            return;
        }

        try {
            this.auth.addUser(username, code, role, AppState.user.username);
            this.renderUserList();
            toast.success(`User ${username} added`);
        } catch (err) {
            toast.error(err.message);
        }
    }

    deleteUser(username) {
        if (!this.access.isMaster()) {
            toast.error('Master access required');
            return;
        }
        if (username === AppState.user.username) {
            toast.error('Cannot delete yourself');
            return;
        }
        if (!confirm(`Delete user ${username}?`)) return;
        try {
            this.auth.removeUser(username, AppState.user.username);
            this.renderUserList();
            toast.info(`User ${username} deleted`);
        } catch (err) {
            toast.error(err.message);
        }
    }

    editUser(username) {
        // For simplicity, we could open a prompt to change role or code.
        toast.info(`Edit user ${username} – not implemented`);
    }

    enableTotp(username) {
        if (!this.access.isMaster()) {
            toast.error('Master access required');
            return;
        }
        const { secret, uri } = this.auth.generateTotpSecret(username);
        document.getElementById('totp-username').innerText = username;
        document.getElementById('totp-secret').innerText = secret;

        // Generate QR code using a library – we'll use a simple approach: create an image URL
        const qrDiv = document.getElementById('totp-qr');
        qrDiv.innerHTML = ''; // Clear previous
        // Use a free QR code API (or you could embed a library). For simplicity, we'll just show the URI.
        // In production, you'd use something like `qrcode.js`.
        qrDiv.innerHTML = `<div style="background:#fff; padding:10px; text-align:center;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(uri)}" alt="QR Code">
        </div>`;

        this.pendingTotpUser = username;
        document.getElementById('totp-modal').classList.remove('hidden');
    }

    verifyTotp() {
        const code = document.getElementById('totp-verify').value.trim();
        const trustDevice = document.getElementById('totp-trust-device').checked;
        if (!this.pendingTotpUser) return;
        if (this.auth.verifyTotp(this.pendingTotpUser, code)) {
            this.auth.enable2FA(this.pendingTotpUser);
            if (trustDevice) {
                this.auth.trustDevice(this.pendingTotpUser);
            }
            this.renderUserList();
            document.getElementById('totp-modal').classList.add('hidden');
            toast.success('2FA enabled');
        } else {
            toast.error('Invalid code');
        }
    }

    promptDisable(username) {
        document.getElementById('disable-username').innerText = username;
        document.getElementById('disable-2fa-modal').classList.remove('hidden');
        this.pendingDisableUser = username;
    }

    disable2FA() {
        if (!this.access.isMaster()) return;
        this.auth.disable2FA(this.pendingDisableUser, AppState.user.username);
        this.renderUserList();
        document.getElementById('disable-2fa-modal').classList.add('hidden');
        toast.info(`2FA disabled for ${this.pendingDisableUser}`);
    }

    refresh() {
        this.renderUserList();
        toast.success('User list refreshed');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.userManagement = new UserManagement();
});