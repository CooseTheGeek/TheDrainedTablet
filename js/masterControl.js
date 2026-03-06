// MASTER CONTROL - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek)
// MASTER ACCESS ONLY - REAL USER MANAGEMENT

class MasterControl {
    constructor() {
        this.tablet = window.drainedTablet;
        this.users = {};
        
        this.init();
    }

    init() {
        this.createUI();
        this.loadUsers();
        this.setupFooterButton();  // <-- ADD THIS
        // REMOVED: this.setupEventListeners(); – not needed, listeners are set in createUI
    }

    setupFooterButton() {
        const footerBtn = document.getElementById('master-control-footer');
        if (footerBtn) {
            footerBtn.addEventListener('click', () => this.showMasterPanel());
        }
    }

    showMasterPanel() {
        // Switch to the master tab
        const homeTab = window.homeTab;
        if (homeTab && typeof homeTab.switchToTab === 'function') {
            homeTab.switchToTab('master');
        } else {
            // Fallback: manually activate the tab
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            const masterPane = document.getElementById('tab-master');
            if (masterPane) {
                masterPane.classList.add('active');
                window.dispatchEvent(new CustomEvent('tab-changed', { detail: { tab: 'master' } }));
            }
        }
    }

    createUI() {
        const masterTab = document.getElementById('tab-master');
        if (!masterTab) return;

        masterTab.innerHTML = `
            <div class="master-panel">
                <h2>👑 MASTER CONTROL</h2>
                <div class="master-warning">⚠️ RESTRICTED ACCESS - MASTERS ONLY ⚠️</div>

                <div class="master-section">
                    <h3>USER MANAGEMENT</h3>
                    <div id="user-list" class="user-list"></div>
                    
                    <div class="add-user-form">
                        <h4>ADD NEW USER</h4>
                        <input type="text" id="new-username" placeholder="Username">
                        <input type="text" id="new-code" placeholder="4-digit code" maxlength="4">
                        <select id="new-level">
                            <option value="user">User</option>
                            <option value="owner">Owner</option>
                            <option value="master">Master</option>
                        </select>
                        <button id="add-user-btn">ADD USER</button>
                    </div>
                </div>

                <div class="master-section">
                    <h3>MASTER SETTINGS</h3>
                    <div class="master-setting">
                        <label>Master Code:</label>
                        <input type="text" id="master-code" value="0325" maxlength="4">
                        <button id="change-master-code">CHANGE</button>
                    </div>
                    <div class="master-setting">
                        <label>Backup Code:</label>
                        <input type="text" id="backup-code" value="2026" maxlength="4">
                        <button id="change-backup-code">CHANGE</button>
                    </div>
                </div>

                <div class="master-section">
                    <h3>SYSTEM ACTIONS</h3>
                    <button id="backup-data" class="master-action">💾 BACKUP DATA</button>
                    <button id="restore-data" class="master-action">🔄 RESTORE DATA</button>
                    <button id="reset-all" class="master-action danger">⚠️ RESET ALL</button>
                </div>
            </div>
        `;

        // Event listeners are attached here directly
        document.getElementById('add-user-btn')?.addEventListener('click', () => this.addUser());
        document.getElementById('change-master-code')?.addEventListener('click', () => this.changeMasterCode());
        document.getElementById('change-backup-code')?.addEventListener('click', () => this.changeBackupCode());
        document.getElementById('backup-data')?.addEventListener('click', () => this.backupData());
        document.getElementById('restore-data')?.addEventListener('click', () => this.restoreData());
        document.getElementById('reset-all')?.addEventListener('click', () => this.resetAll());
    }

    loadUsers() {
        this.users = this.tablet?.loadUsers() || {};
        this.renderUserList();
    }

    renderUserList() {
        const list = document.getElementById('user-list');
        if (!list) return;

        if (Object.keys(this.users).length === 0) {
            list.innerHTML = '<p>No users found</p>';
            return;
        }

        let html = '<table class="user-table">';
        html += '<tr><th>Username</th><th>Level</th><th>Code</th><th>Actions</th></tr>';

        for (let [username, data] of Object.entries(this.users)) {
            html += `
                <tr>
                    <td>${username}</td>
                    <td>${data.level || 'user'}</td>
                    <td>${data.code || '----'}</td>
                    <td>
                        ${username !== 'CooseTheGeek' ? 
                            `<button class="remove-user" data-user="${username}">REMOVE</button>` : 
                            '<span>MASTER</span>'}
                    </td>
                </tr>
            `;
        }

        html += '</table>';
        list.innerHTML = html;

        // Add remove handlers
        document.querySelectorAll('.remove-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const user = e.target.dataset.user;
                this.removeUser(user);
            });
        });
    }

    addUser() {
        if (!this.tablet.isMaster()) {
            this.tablet.showError('Master access required');
            return;
        }

        const username = document.getElementById('new-username').value.trim();
        const code = document.getElementById('new-code').value.trim();
        const level = document.getElementById('new-level').value;

        if (!username || !code) {
            this.tablet.showError('Username and code required');
            return;
        }

        if (code.length !== 4 || isNaN(code)) {
            this.tablet.showError('Code must be 4 digits');
            return;
        }

        if (this.users[username]) {
            this.tablet.showError('User already exists');
            return;
        }

        this.users[username] = {
            code: code,
            level: level,
            created: new Date().toISOString(),
            createdBy: this.tablet.currentUser
        };

        this.tablet.saveUsers(this.users);
        this.renderUserList();
        this.tablet.showToast(`User ${username} added`, 'success');

        // Clear form
        document.getElementById('new-username').value = '';
        document.getElementById('new-code').value = '';
    }

    removeUser(username) {
        if (!this.tablet.isMaster()) {
            this.tablet.showError('Master access required');
            return;
        }

        if (username === 'CooseTheGeek') {
            this.tablet.showError('Cannot remove master');
            return;
        }

        this.tablet.showConfirm(`Remove user ${username}?`, (confirmed) => {
            if (confirmed) {
                delete this.users[username];
                this.tablet.saveUsers(this.users);
                this.renderUserList();
                this.tablet.showToast(`User ${username} removed`, 'info');
            }
        });
    }

    changeMasterCode() {
        if (!this.tablet.isMaster()) {
            this.tablet.showError('Master access required');
            return;
        }

        const newCode = document.getElementById('master-code').value;
        if (newCode.length !== 4 || isNaN(newCode)) {
            this.tablet.showError('Code must be 4 digits');
            return;
        }

        this.tablet.accessCode = newCode;
        this.tablet.showToast('Master code changed', 'success');
    }

    changeBackupCode() {
        if (!this.tablet.isMaster()) {
            this.tablet.showError('Master access required');
            return;
        }

        const newCode = document.getElementById('backup-code').value;
        if (newCode.length !== 4 || isNaN(newCode)) {
            this.tablet.showError('Code must be 4 digits');
            return;
        }

        this.tablet.backupCode = newCode;
        this.tablet.showToast('Backup code changed', 'success');
    }

    backupData() {
        if (!this.tablet.isMaster()) return;

        const data = {
            users: this.users,
            settings: {
                accessCode: this.tablet.accessCode,
                backupCode: this.tablet.backupCode
            },
            timestamp: new Date().toISOString()
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `drained-backup-${Date.now()}.json`;
        a.click();

        this.tablet.showToast('Backup created', 'success');
    }

    restoreData() {
        if (!this.tablet.isMaster()) return;

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.users) {
                        this.users = data.users;
                        this.tablet.saveUsers(this.users);
                        this.renderUserList();
                        this.tablet.showToast('Data restored', 'success');
                    }
                } catch (err) {
                    this.tablet.showError('Invalid backup file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    resetAll() {
        if (!this.tablet.isMaster()) return;

        this.tablet.showConfirm('⚠️ RESET ALL DATA?\nThis cannot be undone!', (confirmed) => {
            if (confirmed) {
                localStorage.clear();
                this.tablet.showToast('All data reset', 'error');
                setTimeout(() => location.reload(), 2000);
            }
        });
    }

    refresh() {
        this.loadUsers();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.masterControl = new MasterControl();
});
