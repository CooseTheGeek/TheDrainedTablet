// user-management.js – DRAINED TABLET ULTIMATE v7.0.0
// User administration for masters and owners.
// Allows adding, removing, and modifying users, as well as managing 2FA.

class UserManagement {
    constructor() {
        this.tablet = window.drainedTablet;
        this.auth = window.authSystem;
        this.access = window.accessControl;
        this.users = this.auth.loadUsers(); // from auth.js
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        // Refresh when tab becomes visible
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'user-management') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-user-management');
        if (!tab) return;
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
                        <div class="form-group checkbox">
                            <label>
                                <input type="checkbox" id="new-totp"> Enable 2FA
                            </label>
                        </div>
                        <button id="add-user" class="user-btn primary">➕ ADD USER</button>
                    </div>
                </div>

                <!-- 2FA Setup Modal -->
                <div id="totp-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3>🔐 2FA SETUP FOR <span id="totp-username"></span></h3>
                        <p>Scan this QR code with your authenticator app:</p>
                        <div id="totp-qr" class="qr-placeholder">[QR CODE]</div>
                        <p>Or enter this secret manually:</p>
                        <div id="totp-secret" class="totp-secret"></div>
                        <p>After scanning, enter the 6‑digit code to verify:</p>
                        <div class="form-group">
                            <input type="text" id="totp-verify" placeholder="123456" maxlength="6">
                        </div>
                        <div class="modal-actions">
                            <button id="verify-totp" class="user-btn primary">VERIFY & ENABLE</button>
                            <button id="cancel-totp" class="user-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        document.getElementById('refresh-users')?.addEventListener('click', () => this.refresh());
        document.getElementById('add-user')?.addEventListener('click', () => this.addUser());
        document.getElementById('cancel-totp')?.addEventListener('click', () => {
            document.getElementById('totp-modal').classList.add('hidden');
        });
        document.getElementById('verify-totp')?.addEventListener('click', () => this.verifyTotp());
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
                        ${!data.totpEnabled ? `<button class="small-btn enable-totp" data-user="${username}">🔐 Enable 2FA</button>` : ''}
                    </td>
                </tr>
            `;
        }
        html += '</table>';
        listDiv.innerHTML = html;

        // Attach event listeners to dynamic buttons
        listDiv.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const user = e.target.dataset.user;
                this.deleteUser(user);
            });
        });
        listDiv.querySelectorAll('.enable-totp').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const user = e.target.dataset.user;
                this.enableTotp(user);
            });
        });
        listDiv.querySelectorAll('.edit-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const user = e.target.dataset.user;
                this.editUser(user);
            });
        });
    }

    addUser() {
        if (!this.access.isMaster()) {
            this.tablet.showError('Master access required');
            return;
        }
        const username = document.getElementById('new-username').value.trim();
        const code = document.getElementById('new-code').value.trim();
        const role = document.getElementById('new-role').value;
        const totp = document.getElementById('new-totp').checked;

        if (!username || !code) {
            this.tablet.showError('Username and code required');
            return;
        }
        if (code.length !== 4 || !/^\d+$/.test(code)) {
            this.tablet.showError('Code must be 4 digits');
            return;
        }

        try {
            this.auth.addUser(username, code, role, AppState.user.username);
            if (totp) {
                this.enableTotp(username);
            }
            this.renderUserList();
            this.tablet.showToast(`User ${username} added`, 'success');
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    deleteUser(username) {
        if (!this.access.isMaster()) {
            this.tablet.showError('Master access required');
            return;
        }
        if (username === AppState.user.username) {
            this.tablet.showError('Cannot delete yourself');
            return;
        }
        this.tablet.showConfirm(`Delete user ${username}?`, (confirmed) => {
            if (confirmed) {
                try {
                    this.auth.removeUser(username, AppState.user.username);
                    this.renderUserList();
                    this.tablet.showToast(`User ${username} deleted`, 'info');
                } catch (err) {
                    this.tablet.showError(err.message);
                }
            }
        });
    }

    editUser(username) {
        // For simplicity, we could open a prompt to change role or code.
        // Implement as needed.
        this.tablet.showToast(`Edit user ${username} - not implemented`, 'info');
    }

    enableTotp(username) {
        if (!this.access.isMaster()) {
            this.tablet.showError('Master access required');
            return;
        }
        const secret = this.auth.generateTotpSecret(username);
        document.getElementById('totp-username').innerText = username;
        document.getElementById('totp-secret').innerText = secret;
        document.getElementById('totp-qr').innerHTML = `[QR for ${secret}]`; // In production, generate QR.
        document.getElementById('totp-modal').classList.remove('hidden');
        this.pendingTotpUser = username;
    }

    verifyTotp() {
        const code = document.getElementById('totp-verify').value;
        if (!this.pendingTotpUser) return;
        if (this.auth.verifyTotp(this.pendingTotpUser, code)) {
            this.auth.enable2FA(this.pendingTotpUser);
            this.renderUserList();
            document.getElementById('totp-modal').classList.add('hidden');
            this.tablet.showToast('2FA enabled', 'success');
        } else {
            this.tablet.showError('Invalid code');
        }
    }

    refresh() {
        this.renderUserList();
        this.tablet.showToast('User list refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.userManagement = new UserManagement();
});