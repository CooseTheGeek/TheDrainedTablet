// CORE ENGINE - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class DrainedTablet {
    constructor() {
        this.version = '7.0.0';
        this.master = 'CooseTheGeek';
        this.currentUser = null;
        this.userLevel = null;
        this.connected = false;
        this.rconConnected = false;
        this.serverConfig = {
            name: 'The Drained Land\'s 3X Monthly',
            ip: '144.126.137.59',
            rconPort: 28916,
            password: 'Thatakspray',
            mapSize: 3500,
            mapSeed: 10325
        };
        this.users = this.loadUsers();
        this.sessions = {};
        this.activeTab = 'home';
        this.refreshIntervals = [];
        this.init();
    }

    loadUsers() {
        const saved = localStorage.getItem('drained_users');
        if (saved) {
            return JSON.parse(saved);
        }
        // Default users
        return {
            'CooseTheGeek': { code: '10325', level: 'master', created: new Date().toISOString() },
            'Casey': { code: '10325', level: 'master', created: new Date().toISOString() }
        };
    }

    saveUsers() {
        localStorage.setItem('drained_users', JSON.stringify(this.users));
    }

    init() {
        console.log('DRAINED TABLET v' + this.version + ' initializing...');
        this.setupEventListeners();
        this.checkSavedSession();
        this.loadTabs();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Sign out button
        const signOutBtn = document.getElementById('sign-out-btn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => this.signOut());
        }

        // Numpad buttons
        document.querySelectorAll('.numpad-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.doorLocked) return;
                const num = e.target.dataset.num;
                this.handleNumpad(num);
            });
        });

        // Unlock button
        const unlockBtn = document.getElementById('unlock-btn');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => this.tryUnlock());
        }

        // Clear button
        const clearBtn = document.getElementById('clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCode());
        }

        // Forgot code button
        const forgotBtn = document.getElementById('forgot-btn');
        if (forgotBtn) {
            forgotBtn.addEventListener('click', () => this.forgotCode());
        }
    }

    checkSavedSession() {
        const session = localStorage.getItem('drained_session');
        if (session) {
            const data = JSON.parse(session);
            if (data.remember && data.expires > Date.now()) {
                this.autoLogin(data.username, data.code);
            }
        }
    }

    autoLogin(username, code) {
        if (this.users[username] && this.users[username].code === code) {
            this.currentUser = username;
            this.userLevel = this.users[username].level;
            document.getElementById('security-door').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            document.getElementById('current-user').innerText = username;
            this.showToast('Welcome back, ' + username, 'success');
            this.startSession();
        }
    }

    handleNumpad(num) {
        const display = document.getElementById('code-display');
        let currentCode = display.innerText.replace(/\*/g, '');
        
        if (num === 'C') {
            this.clearCode();
            return;
        }
        
        if (currentCode.length < 4) {
            currentCode += num;
            display.innerText = '*'.repeat(currentCode.length);
            this.currentCode = currentCode;
        }
    }

    clearCode() {
        document.getElementById('code-display').innerText = '';
        this.currentCode = '';
        this.attempts = 3;
        document.getElementById('attempts').innerText = '3 attempts remaining';
    }

    tryUnlock() {
        if (!this.currentCode || this.currentCode.length !== 4) {
            this.showError('Please enter a 4-digit code');
            return;
        }

        let valid = false;
        let username = '';

        // Check all users
        for (let [user, data] of Object.entries(this.users)) {
            if (data.code === this.currentCode) {
                valid = true;
                username = user;
                this.userLevel = data.level;
                break;
            }
        }

        // Master override
        if (this.currentCode === 'COOSE2026') {
            valid = true;
            username = 'CooseTheGeek';
            this.userLevel = 'master';
        }

        if (valid) {
            this.currentUser = username;
            document.getElementById('security-door').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
            document.getElementById('current-user').innerText = username;
            this.showToast('Welcome, ' + username, 'success');
            this.startSession();
            this.clearCode();
        } else {
            this.attempts = (this.attempts || 3) - 1;
            document.getElementById('attempts').innerText = this.attempts + ' attempts remaining';
            this.showError('Invalid code');
            this.clearCode();
            
            if (this.attempts <= 0) {
                this.lockDoor();
            }
        }
    }

    lockDoor() {
        this.doorLocked = true;
        document.getElementById('security-door').innerHTML = `
            <div class="door-content">
                <h1>🔒 LOCKED 🔒</h1>
                <p>Too many failed attempts</p>
                <p>Contact master: CooseTheGeek</p>
            </div>
        `;
    }

    forgotCode() {
        this.showToast('Contact master: CooseTheGeek', 'info');
    }

    startSession() {
        const sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
        this.sessions[sessionId] = {
            user: this.currentUser,
            level: this.userLevel,
            start: new Date().toISOString(),
            lastActive: Date.now()
        };
        
        // Start live updates if connected
        if (this.connected) {
            this.startLiveUpdates();
        }
    }

    signOut() {
        this.currentUser = null;
        this.userLevel = null;
        this.connected = false;
        this.rconConnected = false;
        
        // Stop all intervals
        this.refreshIntervals.forEach(interval => clearInterval(interval));
        this.refreshIntervals = [];
        
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('security-door').classList.remove('hidden');
        document.getElementById('connection-status').innerHTML = '⚫ DISCONNECTED';
        document.getElementById('server-status').innerHTML = '⚫ OFFLINE';
        
        localStorage.removeItem('drained_session');
        this.showToast('Signed out', 'info');
    }

    async connectToServer() {
        document.getElementById('connection-status').innerHTML = '🟡 CONNECTING...';
        
        try {
            // Simulate connection (in real version, this would be actual RCON)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.connected = true;
            this.rconConnected = true;
            document.getElementById('connection-status').innerHTML = '🟢 CONNECTED to ' + this.serverConfig.ip;
            document.getElementById('server-status').innerHTML = '🟢 ONLINE';
            this.showToast('Connected to server', 'success');
            
            if (this.currentUser) {
                this.startLiveUpdates();
            }
            
            return true;
        } catch (error) {
            this.connected = false;
            document.getElementById('connection-status').innerHTML = '🔴 CONNECTION FAILED';
            document.getElementById('server-status').innerHTML = '🔴 OFFLINE';
            this.showError('Failed to connect to server');
            return false;
        }
    }

    startLiveUpdates() {
        // Update player list every 5 seconds
        this.refreshIntervals.push(setInterval(() => this.updatePlayerList(), 5000));
        
        // Update server status every 10 seconds
        this.refreshIntervals.push(setInterval(() => this.updateServerStatus(), 10000));
        
        // Update map every 5 seconds
        this.refreshIntervals.push(setInterval(() => this.updateMap(), 5000));
    }

    updatePlayerList() {
        if (!this.connected || !this.currentUser) return;
        
        // This would be actual RCON call
        const mockPlayers = [
            { name: 'RustGod', health: 76, x: 1245, y: 45, z: 678 },
            { name: 'BuilderBob', health: 92, x: 2341, y: 67, z: 891 },
            { name: 'PvPKing', health: 34, x: 3456, y: 78, z: 123 }
        ];
        
        // Update any UI elements listening for this
        window.dispatchEvent(new CustomEvent('player-update', { detail: mockPlayers }));
    }

    updateServerStatus() {
        if (!this.connected || !this.currentUser) return;
        
        const status = {
            players: Math.floor(Math.random() * 50) + 10,
            fps: 60,
            uptime: '3d 4h',
            memory: '42%'
        };
        
        window.dispatchEvent(new CustomEvent('status-update', { detail: status }));
    }

    updateMap() {
        if (!this.connected || !this.currentUser) return;
        
        window.dispatchEvent(new CustomEvent('map-update'));
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-pane').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        const selectedTab = document.getElementById('tab-' + tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Add active class to clicked button
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.activeTab = tabName;
        
        // Trigger tab-specific load events
        window.dispatchEvent(new CustomEvent('tab-changed', { detail: { tab: tabName } }));
    }

    loadTabs() {
        // This will be populated by individual tab modules
        console.log('Tabs ready to load');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-message');
        
        if (!toast || !toastMsg) return;
        
        toastMsg.innerText = message;
        toast.className = 'toast show ' + type;
        
        setTimeout(() => {
            toast.className = 'toast hidden';
        }, 3000);
    }

    showError(message) {
        const modal = document.getElementById('error-modal');
        const msgEl = document.getElementById('error-message');
        
        if (!modal || !msgEl) return;
        
        msgEl.innerText = message;
        modal.classList.remove('hidden');
        
        const closeBtn = document.getElementById('error-close');
        if (closeBtn) {
            closeBtn.onclick = () => modal.classList.add('hidden');
        }
    }

    showConfirm(message, callback) {
        const modal = document.getElementById('confirm-modal');
        const msgEl = document.getElementById('confirm-message');
        
        if (!modal || !msgEl) return;
        
        msgEl.innerText = message;
        modal.classList.remove('hidden');
        
        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-no');
        
        yesBtn.onclick = () => {
            modal.classList.add('hidden');
            callback(true);
        };
        
        noBtn.onclick = () => {
            modal.classList.add('hidden');
            callback(false);
        };
    }

    isMaster() {
        return this.userLevel === 'master' || this.currentUser === 'CooseTheGeek';
    }

    isOwner() {
        return this.userLevel === 'owner' || this.userLevel === 'master' || this.currentUser === 'CooseTheGeek';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.drainedTablet = new DrainedTablet();
});