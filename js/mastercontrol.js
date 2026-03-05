// MASTER CONTROL - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class MasterControl {
    constructor(tablet) {
        this.tablet = tablet;
        this.masters = ['CooseTheGeek', 'Casey'];
        this.accessLogs = this.loadLogs();
        this.init();
    }

    loadLogs() {
        const saved = localStorage.getItem('drained_master_logs');
        return saved ? JSON.parse(saved) : [];
    }

    saveLogs() {
        localStorage.setItem('drained_master_logs', JSON.stringify(this.accessLogs));
    }

    init() {
        this.createMasterHTML();
        this.setupEventListeners();
        this.refreshData();
        
        // Check access on tab show
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'master') {
                this.checkAccess();
            }
        });
    }

    createMasterHTML() {
        const masterTab = document.getElementById('tab-master');
        if (!masterTab) return;

        masterTab.innerHTML = `
            <div class="master-container">
                <div class="master-header">
                    <h2>👑 MASTER CONTROL</h2>
                    <div class="master-warning">⚠️ RESTRICTED ACCESS - MASTERS ONLY ⚠️</div>
                </div>
                
                <div class="master-grid">
                    <!-- Left Column - User Management -->
                    <div class="master-section">
                        <h3>USER MANAGEMENT</h3>
                        
                        <div class="users-list" id="users-list"></div>
                        
                        <div class="add-user-form">
                            <h4>ADD NEW USER</h4>
                            <input type="text" id="new-username" placeholder="Username">
                            <input type="text" id="new-code" placeholder="4-digit code" maxlength="4">
                            <select id="new-level">
                                <option value="user">User</option>
                                <option value="owner">Owner</option>
                                <option value="master">Master</option>
                            </select>
                            <button id="add-user-btn" class="master-btn">ADD USER</button>
                        </div>
                    </div>
                    
                    <!-- Center Column - Active Sessions -->
                    <div class="master-section">
                        <h3>ACTIVE SESSIONS</h3>
                        <div id="sessions-list" class="sessions-list"></div>
                        
                        <h4 style="margin-top: 20px;">RECENT ACCESS LOGS</h4>
                        <div id="access-logs" class="access-logs"></div>
                    </div>
                    
                    <!-- Right Column - Master Management -->
                    <div class="master-section">
                        <h3>MASTER OWNERS</h3>
                        <div id="masters-list" class="masters-list"></div>
                        
                        <div class="add-master-form">
                            <h4>ADD NEW MASTER</h4>
                            <input type="text" id="new-master" placeholder="Username">
                            <input type="text" id="new-master-code" placeholder="4-digit code" maxlength="4">
                            <button id="add-master-btn" class="master-btn warning">ADD MASTER</button>
                        </div>
                        
                        <div class="master-actions">
                            <h4>SERVER ACTIONS</h4>
                            <button id="ban-player-btn" class="master-btn">BAN PLAYER</button>
                            <button id="kick-player-btn" class="master-btn">KICK PLAYER</button>
                            <button id="mute-player-btn" class="master-btn">MUTE PLAYER</button>
                            <button id="shutdown-server-btn" class="master-btn danger">SHUTDOWN SERVER</button>
                            <button id="restart-server-btn" class="master-btn warning">RESTART SERVER</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('add-user-btn')?.addEventListener('click', () => this.addUser());
        document.getElementById('add-master-btn')?.addEventListener('click', () => this.addMaster());
        
        document.getElementById('ban-player-btn')?.addEventListener('click', () => this.banPlayer());
        document.getElementById('kick-player-btn')?.addEventListener('click', () => this.kickPlayer());
        document.getElementById('mute-player-btn')?.addEventListener('click', () => this.mutePlayer());
        document.getElementById('shutdown-server-btn')?.addEventListener('click', () => this.shutdownServer());
        document.getElementById('restart-server-btn')?.addEventListener('click', () => this.restartServer());
    }

    checkAccess() {
        if (!this.tablet.isMaster()) {
            this.tablet.showError('Master access required');
            this.tablet.switchTab('home');
            return false;
        }
        return true;
    }

    refreshData() {
        this.updateUsersList();
        this.updateSessionsList();
        this.updateMastersList();
        this.updateAccessLogs();
    }

    updateUsersList() {
        const list = document.getElementById('users-list');
        if (!list) return;

        let html = '<table class="users-table"><tr><th>User</th><th>Code</th><th>Level</th><th>Actions</th></tr>';
        
        Object.entries(this.tablet.users).forEach(([username, data]) => {
            html += `
                <tr>
                    <td>${username}</td>
                    <td>${data.code}</td>
                    <td>${data.level}</td>
                    <td>
                        <button class="small-btn" onclick="masterControl.editUser('${username}')">✏️</button>
                        <button class="small-btn" onclick="masterControl.resetCode('${username}')">🔄</button>
                        ${username !== 'CooseTheGeek' ? `<button class="small-btn danger" onclick="masterControl.removeUser('${username}')">🗑️</button>` : ''}
                    </td>
                </tr>
            `;
        });
        
        html += '</table>';
        list.innerHTML = html;
    }

    updateSessionsList() {
        const list = document.getElementById('sessions-list');
        if (!list) return;

        const sessions = this.tablet.security?.getActiveSessions() || {};
        
        if (Object.keys(sessions).length === 0) {
            list.innerHTML = '<div class="no-sessions">No active sessions</div>';
            return;
        }

        let html = '';
        Object.entries(sessions).forEach(([sessionId, session]) => {
            const activeTime = Math.floor((Date.now() - new Date(session.lastActive).getTime()) / 1000 / 60);
            html += `
                <div class="session-item">
                    <div class="session-user">${session.user}</div>
                    <div class="session-time">Active: ${activeTime}m ago</div>
                    <button class="small-btn danger" onclick="masterControl.terminateSession('${sessionId}')">TERMINATE</button>
                </div>
            `;
        });
        
        list.innerHTML = html;
    }

    updateMastersList() {
        const list = document.getElementById('masters-list');
        if (!list) return;

        let html = '<table class="masters-table"><tr><th>Master</th><th>Status</th><th>Actions</th></tr>';
        
        this.masters.forEach(master => {
            const isOnline = this.checkMasterOnline(master);
            html += `
                <tr>
                    <td>${master} ${master === 'CooseTheGeek' ? '(PRIMARY)' : ''}</td>
                    <td><span class="status-dot ${isOnline ? 'online' : 'offline'}"></span> ${isOnline ? 'Online' : 'Offline'}</td>
                    <td>
                        ${master !== 'CooseTheGeek' ? `<button class="small-btn" onclick="masterControl.removeMaster('${master}')">REMOVE</button>` : ''}
                    </td>
                </tr>
            `;
        });
        
        html += '</table>';
        list.innerHTML = html;
    }

    updateAccessLogs() {
        const logs = document.getElementById('access-logs');
        if (!logs) return;

        let html = '<div class="logs-container">';
        this.accessLogs.slice(0, 20).forEach(log => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            html += `
                <div class="log-entry ${log.status}">
                    <span class="log-time">[${time}]</span>
                    <span class="log-user">${log.user}</span>
                    <span class="log-action">${log.action}</span>
                    <span class="log-ip">${log.ip || 'local'}</span>
                </div>
            `;
        });
        
        html += '</div>';
        logs.innerHTML = html;
    }

    checkMasterOnline(master) {
        // Check if master has active session
        const sessions = this.tablet.security?.getActiveSessions() || {};
        return Object.values(sessions).some(s => s.user === master);
    }

    addUser() {
        if (!this.checkAccess()) return;
        
        const username = document.getElementById('new-username').value.trim();
        const code = document.getElementById('new-code').value.trim();
        const level = document.getElementById('new-level').value;
        
        if (!username || !code) {
            this.tablet.showError('Username and code required');
            return;
        }
        
        if (code.length !== 4 || !/^\d+$/.test(code)) {
            this.tablet.showError('Code must be 4 digits');
            return;
        }
        
        if (this.tablet.users[username]) {
            this.tablet.showError('User already exists');
            return;
        }
        
        this.tablet.users[username] = {
            code: code,
            level: level,
            created: new Date().toISOString(),
            createdBy: this.tablet.currentUser
        };
        
        this.tablet.saveUsers();
        this.logAccess('USER_ADDED', username);
        this.refreshData();
        this.tablet.showToast(`User ${username} added`, 'success');
        
        document.getElementById('new-username').value = '';
        document.getElementById('new-code').value = '';
    }

    addMaster() {
        if (!this.checkAccess() || this.tablet.currentUser !== 'CooseTheGeek') {
            this.tablet.showError('Only CooseTheGeek can add masters');
            return;
        }
        
        const username = document.getElementById('new-master').value.trim();
        const code = document.getElementById('new-master-code').value.trim();
        
        if (!username || !code) {
            this.tablet.showError('Username and code required');
            return;
        }
        
        if (code.length !== 4 || !/^\d+$/.test(code)) {
            this.tablet.showError('Code must be 4 digits');
            return;
        }
        
        if (this.masters.includes(username)) {
            this.tablet.showError('Already a master');
            return;
        }
        
        this.masters.push(username);
        this.tablet.users[username] = {
            code: code,
            level: 'master',
            created: new Date().toISOString(),
            createdBy: this.tablet.currentUser
        };
        
        this.tablet.saveUsers();
        this.logAccess('MASTER_ADDED', username);
        this.refreshData();
        this.tablet.showToast(`${username} is now a master`, 'success');
        
        document.getElementById('new-master').value = '';
        document.getElementById('new-master-code').value = '';
    }

    editUser(username) {
        if (!this.checkAccess()) return;
        
        const newCode = prompt(`Enter new 4-digit code for ${username}:`);
        if (!newCode) return;
        
        if (newCode.length !== 4 || !/^\d+$/.test(newCode)) {
            this.tablet.showError('Code must be 4 digits');
            return;
        }
        
        this.tablet.users[username].code = newCode;
        this.tablet.saveUsers();
        this.logAccess('USER_EDITED', username);
        this.refreshData();
        this.tablet.showToast(`Code updated for ${username}`, 'success');
    }

    resetCode(username) {
        if (!this.checkAccess()) return;
        
        const newCode = Math.floor(1000 + Math.random() * 9000).toString();
        this.tablet.users[username].code = newCode;
        this.tablet.saveUsers();
        this.logAccess('CODE_RESET', username);
        this.refreshData();
        this.tablet.showToast(`New code for ${username}: ${newCode}`, 'success');
    }

    removeUser(username) {
        if (!this.checkAccess()) return;
        
        if (username === 'CooseTheGeek') {
            this.tablet.showError('Cannot remove primary master');
            return;
        }
        
        this.tablet.showConfirm(`Remove user ${username}?`, (confirmed) => {
            if (confirmed) {
                delete this.tablet.users[username];
                this.tablet.saveUsers();
                this.logAccess('USER_REMOVED', username);
                this.refreshData();
                this.tablet.showToast(`User ${username} removed`, 'info');
            }
        });
    }

    removeMaster(username) {
        if (!this.checkAccess() || this.tablet.currentUser !== 'CooseTheGeek') {
            this.tablet.showError('Only CooseTheGeek can remove masters');
            return;
        }
        
        if (username === 'CooseTheGeek') {
            this.tablet.showError('Cannot remove primary master');
            return;
        }
        
        this.tablet.showConfirm(`Remove master ${username}?`, (confirmed) => {
            if (confirmed) {
                this.masters = this.masters.filter(m => m !== username);
                if (this.tablet.users[username]) {
                    this.tablet.users[username].level = 'user';
                }
                this.tablet.saveUsers();
                this.logAccess('MASTER_REMOVED', username);
                this.refreshData();
                this.tablet.showToast(`${username} is no longer a master`, 'info');
            }
        });
    }

    terminateSession(sessionId) {
        if (!this.checkAccess()) return;
        
        if (this.tablet.security?.terminateSession(sessionId, this.tablet.currentUser)) {
            this.refreshData();
        }
    }

    banPlayer() {
        if (!this.checkAccess()) return;
        
        const player = prompt('Enter player name to ban:');
        if (!player) return;
        
        const reason = prompt('Reason for ban:');
        if (!reason) return;
        
        const duration = prompt('Duration in hours (0 for permanent):', '0');
        
        this.tablet.showConfirm(`Ban ${player}?`, (confirmed) => {
            if (confirmed) {
                this.logAccess('PLAYER_BANNED', `${player} - ${reason}`);
                this.tablet.showToast(`${player} banned`, 'warning');
            }
        });
    }

    kickPlayer() {
        if (!this.checkAccess()) return;
        
        const player = prompt('Enter player name to kick:');
        if (!player) return;
        
        this.tablet.showConfirm(`Kick ${player}?`, (confirmed) => {
            if (confirmed) {
                this.logAccess('PLAYER_KICKED', player);
                this.tablet.showToast(`${player} kicked`, 'info');
            }
        });
    }

    mutePlayer() {
        if (!this.checkAccess()) return;
        
        const player = prompt('Enter player name to mute:');
        if (!player) return;
        
        const duration = prompt('Mute duration in minutes:', '30');
        
        this.tablet.showConfirm(`Mute ${player} for ${duration} minutes?`, (confirmed) => {
            if (confirmed) {
                this.logAccess('PLAYER_MUTED', `${player} - ${duration}m`);
                this.tablet.showToast(`${player} muted`, 'info');
            }
        });
    }

    shutdownServer() {
        if (!this.checkAccess()) return;
        
        this.tablet.showConfirm('⚠️ SHUTDOWN SERVER? ⚠️\nThis will kick all players and shut down the server.', (confirmed) => {
            if (confirmed) {
                this.logAccess('SERVER_SHUTDOWN', 'initiated');
                this.tablet.showToast('Server shutting down...', 'error');
            }
        });
    }

    restartServer() {
        if (!this.checkAccess()) return;
        
        this.tablet.showConfirm('⚠️ RESTART SERVER? ⚠️\nThis will kick all players and restart the server.', (confirmed) => {
            if (confirmed) {
                this.logAccess('SERVER_RESTART', 'initiated');
                this.tablet.showToast('Server restarting...', 'warning');
            }
        });
    }

    logAccess(action, details) {
        this.accessLogs.unshift({
            timestamp: new Date().toISOString(),
            user: this.tablet.currentUser,
            action: action,
            details: details,
            ip: 'local'
        });
        
        if (this.accessLogs.length > 100) {
            this.accessLogs.pop();
        }
        
        this.saveLogs();
        this.updateAccessLogs();
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.masterControl = new MasterControl(window.drainedTablet);
});