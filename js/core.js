// CORE ENGINE - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek)
// All Rights Reserved - Proprietary Software
// 
// Handles: RCON (HTTP bridge), user sessions, real-time updates,
// player tracking, server communication, and global state.
// 
// ⚠️ NO MOCK DATA - ALL DATA COMES FROM REAL RCON CONNECTIONS
// ⚠️ If server is offline, displays offline state - no fake players

class DrainedTablet {
    constructor() {
        // Version and Ownership
        this.version = '7.0.0';
        this.storageVersion = '1'; // increment when localStorage format changes
        this.master = 'CooseTheGeek';
        this.build = '2026.03.04';
        
        // User State
        this.currentUser = null;
        this.userLevel = null;
        this.authenticated = false;
        
        // Connection State
        this.connected = false;
        this.connecting = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
        this.reconnectDelay = 5000;
        this.connectionTimeout = null;
        
        // Server Configuration - YOUR ACTUAL CREDENTIALS
        this.serverConfig = {
            name: 'The Drained Land\'s 3X Monthly',
            ip: '144.126.137.59',
            rconPort: 28916,
            password: 'Thatakspray',
            mapSize: 3500,
            mapSeed: 10325,
            maxPlayers: 100
        };
        
        // Data Storage
        this.realPlayers = [];
        this.serverStats = {
            fps: 0,
            cpu: 0,
            memory: 0,
            uptime: '0d 0h 0m',
            entities: 0,
            activeEvents: []
        };
        this.eventListeners = new Map();
        this.refreshIntervals = new Map();
        this.pendingCommands = new Map();
        this.commandTimeout = 10000;
        
        // Security
        this.accessCode = '0325';
        this.backupCode = '2026';
        this.sessionToken = null;
        this.sessionExpiry = null;
        
        // Bridge URL (ngrok – replace if needed)
        this.bridgeUrl = 'https://unconvulsed-unperpendicularly-lenard.ngrok-free.dev';
        
        // Initialize with full error recovery
        try {
            this.checkStorageVersion(); // clear old data if needed
            this.init();
        } catch (error) {
            console.error('❌ Fatal core init error:', error);
            this.purgeAllData(); // nuclear option – clear everything
            this.showSecurityDoor(); // force door
        }
    }

    checkStorageVersion() {
        const storedVersion = localStorage.getItem('drained_storage_version');
        if (storedVersion !== this.storageVersion) {
            console.log('🔄 Storage version mismatch – clearing old data');
            this.purgeAllData();
            localStorage.setItem('drained_storage_version', this.storageVersion);
        }
    }

    purgeAllData() {
        const keysToKeep = ['drained_storage_version']; // keep only version marker
        Object.keys(localStorage).forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        console.log('🧹 Old storage data cleared');
    }

    init() {
        console.log(`🚀 DRAINED TABLET v${this.version} initializing...`);
        
        // Load saved session (if exists) – wrapped in try-catch
        try {
            this.loadSession();
        } catch (e) {
            console.warn('Session load failed, clearing corrupted data');
            localStorage.removeItem('drained_session');
        }
        
        // Setup event listeners
        this.setupGlobalListeners();
        
        // Check authentication state
        this.checkAuth();
        
        // Show appropriate view
        if (this.currentUser) {
            this.unlockDashboard();
        } else {
            this.showSecurityDoor();
        }
        
        console.log('✅ Core engine initialized');
    }

    loadSession() {
        try {
            const saved = localStorage.getItem('drained_session');
            if (saved) {
                const session = JSON.parse(saved);
                
                // Check if session is still valid (8 hours)
                if (session.expires > Date.now()) {
                    this.currentUser = session.user;
                    this.userLevel = session.level;
                    this.sessionToken = session.token;
                    this.sessionExpiry = session.expires;
                    
                    console.log(`🔄 Session restored for ${this.currentUser}`);
                } else {
                    // Session expired - clear it
                    localStorage.removeItem('drained_session');
                    console.log('⚠️ Session expired');
                }
            }
        } catch (e) {
            console.error('Failed to load session:', e);
            localStorage.removeItem('drained_session');
        }
    }

    saveSession() {
        try {
            const session = {
                user: this.currentUser,
                level: this.userLevel,
                token: this.generateToken(),
                expires: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
            };
            
            localStorage.setItem('drained_session', JSON.stringify(session));
            this.sessionToken = session.token;
            this.sessionExpiry = session.expires;
            
            console.log('💾 Session saved');
        } catch (e) {
            console.error('Failed to save session:', e);
        }
    }

    generateToken() {
        return 'token_' + Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    setupGlobalListeners() {
        // Window events
        window.addEventListener('beforeunload', () => this.handleBeforeUnload());
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Custom events
        window.addEventListener('player-update', (e) => this.handlePlayerUpdate(e.detail));
        window.addEventListener('server-update', (e) => this.handleServerUpdate(e.detail));
        window.addEventListener('tab-changed', (e) => this.handleTabChange(e.detail));
        
        // Document events
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        console.log('👂 Global listeners registered');
    }

    handleBeforeUnload() {
        // Clean up before page unload
        this.stopAllIntervals();
        // No WebSocket to disconnect
    }

    handleOnline() {
        console.log('🌐 Browser online - checking connection');
        if (this.currentUser && !this.connected) {
            this.connectToServer();
        }
    }

    handleOffline() {
        console.log('🌐 Browser offline');
        this.updateConnectionStatus('offline', 'OFFLINE - Check Internet');
        this.realPlayers = []; // Clear players when offline
        this.dispatchPlayerUpdate();
    }

    handlePlayerUpdate(players) {
        this.realPlayers = players || [];
        this.dispatchPlayerUpdate();
    }

    dispatchPlayerUpdate() {
        window.dispatchEvent(new CustomEvent('players-updated', { 
            detail: { players: this.realPlayers } 
        }));
    }

    handleServerUpdate(stats) {
        this.serverStats = { ...this.serverStats, ...stats };
        window.dispatchEvent(new CustomEvent('stats-updated', { 
            detail: this.serverStats 
        }));
    }

    handleTabChange(tab) {
        console.log(`📱 Switched to tab: ${tab}`);
        this.refreshTab(tab);
    }

    handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            console.log('👁️ Page visible - resuming updates');
            this.resumeUpdates();
        } else {
            console.log('👁️ Page hidden - pausing updates');
            this.pauseUpdates();
        }
    }

    checkAuth() {
        const door = document.getElementById('security-door');
        const dashboard = document.getElementById('dashboard');
        
        if (!door || !dashboard) {
            console.error('❌ Required DOM elements not found');
            return;
        }
        
        if (this.currentUser) {
            door.style.display = 'none';
            dashboard.classList.add('visible');
            const userEl = document.getElementById('profile-link');
            if (userEl) userEl.innerText = `👤 ${this.currentUser}`;
        } else {
            door.style.display = 'flex';
            dashboard.classList.remove('visible');
        }
    }

    showSecurityDoor() {
        const door = document.getElementById('security-door');
        const dashboard = document.getElementById('dashboard');
        
        if (door && dashboard) {
            door.style.display = 'flex';
            dashboard.classList.remove('visible');
        }
    }

    unlockDashboard() {
        const door = document.getElementById('security-door');
        const dashboard = document.getElementById('dashboard');
        
        if (door && dashboard) {
            door.style.display = 'none';
            dashboard.classList.add('visible');
            
            const userEl = document.getElementById('profile-link');
            if (userEl) userEl.innerText = `👤 ${this.currentUser}`;
            
            console.log(`🔓 Dashboard unlocked for ${this.currentUser}`);
        }
    }

    stopAllIntervals() {
        for (let [key, interval] of this.refreshIntervals) {
            clearInterval(interval);
            console.log(`⏹️ Stopped interval: ${key}`);
        }
        this.refreshIntervals.clear();
    }

    pauseUpdates() {
        // No heartbeat to pause
    }

    resumeUpdates() {
        this.refreshAll();
    }

    refreshTab(tab) {
        if (!this.connected) return; // No data if not connected
        
        switch(tab) {
            case 'home':
                this.refreshHome();
                break;
            case 'livemap':
                this.refreshMap();
                break;
            case 'players':
                this.fetchRealPlayers();
                break;
            case 'status':
                this.fetchServerStats();
                break;
            default:
                // Other tabs may have their own refresh mechanisms
                break;
        }
    }

    refreshAll() {
        if (!this.connected) return;
        this.fetchRealPlayers();
        this.fetchServerStats();
    }

    refreshHome() {
        if (this.currentUser && this.connected) {
            this.fetchPlayerStats(this.currentUser);
        }
    }

    refreshMap() {
        window.dispatchEvent(new CustomEvent('map-refresh'));
    }

    // ===== HTTP-BASED RCON METHODS =====
    
    async connectToServer() {
        if (this.connecting) {
            console.log('🔄 Already connecting...');
            return false;
        }
        
        this.connecting = true;
        this.updateConnectionStatus('connecting', 'CONNECTING...');
        
        try {
            // Get current credentials from profile tab
            const ipInput = document.getElementById('server-ip');
            const portInput = document.getElementById('rcon-port');
            const passInput = document.getElementById('rcon-pass');
            
            if (ipInput && portInput && passInput) {
                this.serverConfig.ip = ipInput.value || this.serverConfig.ip;
                this.serverConfig.rconPort = parseInt(portInput.value) || this.serverConfig.rconPort;
                this.serverConfig.password = passInput.value || this.serverConfig.password;
            }
            
            const response = await fetch(`${this.bridgeUrl}/api/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    ip: this.serverConfig.ip,
                    port: this.serverConfig.rconPort,
                    password: this.serverConfig.password
                })
            });
            
            const data = await response.json();
            
            if (data.success && data.online) {
                this.connected = true;
                this.connecting = false;
                this.reconnectAttempts = 0;
                
                this.updateConnectionStatus('online', 'CONNECTED');
                this.startRealTimeUpdates();
                
                // Immediately fetch real data
                this.fetchRealPlayers();
                this.fetchServerStats();
                
                this.showToast('Connected to server', 'success');
                
                // Update profile tab status
                const statusEl = document.getElementById('connection-result');
                if (statusEl) {
                    statusEl.innerHTML = '<p style="color: var(--success)">✓ Connected to server</p>';
                }
                
                console.log('✅ RCON Connection established via bridge');
                return true;
            } else {
                throw new Error(data.error || 'Connection failed');
            }
            
        } catch (error) {
            console.error('❌ Connection error:', error);
            
            this.connected = false;
            this.connecting = false;
            this.realPlayers = [];
            
            this.updateConnectionStatus('offline', 'CONNECTION FAILED');
            
            const statusEl = document.getElementById('connection-result');
            if (statusEl) {
                statusEl.innerHTML = '<p style="color: var(--error)">✗ Connection failed</p>';
            }
            
            this.showError('Failed to connect to server. Verify credentials and bridge.');
            
            if (this.currentUser) {
                this.scheduleReconnect();
            }
            
            this.dispatchPlayerUpdate();
            return false;
        }
    }

    async sendCommand(command) {
        if (!this.connected) {
            throw new Error('Not connected');
        }
        
        const response = await fetch(`${this.bridgeUrl}/api/command`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({
                ip: this.serverConfig.ip,
                port: this.serverConfig.rconPort,
                password: this.serverConfig.password,
                command: command
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Command failed');
        }
        
        return data.result;
    }

    async fetchRealPlayers() {
        if (!this.connected) {
            this.realPlayers = [];
            this.dispatchPlayerUpdate();
            return;
        }
        
        try {
            const response = await this.sendCommand('status');
            this.realPlayers = this.parsePlayerList(response);
            this.dispatchPlayerUpdate();
        } catch (error) {
            console.error('Failed to fetch players:', error);
            this.realPlayers = [];
            this.dispatchPlayerUpdate();
        }
    }

    async fetchServerStats() {
        if (!this.connected) return;
        
        try {
            const fps = await this.sendCommand('server.fps');
            const cpu = await this.sendCommand('server.cpu');
            const mem = await this.sendCommand('server.memory');
            const uptime = await this.sendCommand('server.uptime');
            const entities = await this.sendCommand('entity.count');
            
            this.serverStats = {
                fps: parseInt(fps) || 0,
                cpu: parseInt(cpu) || 0,
                memory: parseInt(mem) || 0,
                uptime: uptime || '0d 0h 0m',
                entities: parseInt(entities) || 0
            };
            
            this.updateServerStatsUI();
            window.dispatchEvent(new CustomEvent('stats-updated', { detail: this.serverStats }));
            
        } catch (error) {
            console.error('Failed to fetch server stats:', error);
        }
    }

    parsePlayerList(response) {
        const players = [];
        if (!response || typeof response !== 'string') return players;
        
        const lines = response.split('\n');
        
        lines.forEach(line => {
            line = line.trim();
            if (!line) return;
            
            // Format 1: "ID: 76561198012345678 | Name: RustGod | Position: 1245 45 678"
            const format1 = line.match(/Name:\s*([^|\n]+)/i);
            if (format1) {
                players.push({
                    name: format1[1].trim(),
                    online: true,
                    id: this.extractId(line),
                    position: this.extractPosition(line),
                    lastSeen: Date.now()
                });
                return;
            }
            
            // Format 2: "76561198012345678,RustGod,1245,45,678"
            const format2 = line.split(',');
            if (format2.length >= 2) {
                players.push({
                    name: format2[1].trim(),
                    online: true,
                    id: format2[0].trim(),
                    position: format2.length >= 5 ? {
                        x: parseFloat(format2[2]),
                        y: parseFloat(format2[3]),
                        z: parseFloat(format2[4])
                    } : null,
                    lastSeen: Date.now()
                });
                return;
            }
            
            // Format 3: Just player name (fallback)
            if (line && !line.includes('ID') && !line.includes('Name') && !line.includes('---')) {
                players.push({
                    name: line,
                    online: true,
                    lastSeen: Date.now()
                });
            }
        });
        
        return players;
    }

    extractId(line) {
        const match = line.match(/ID:\s*(\d+)/i);
        return match ? match[1] : null;
    }

    extractPosition(line) {
        const match = line.match(/Position:\s*\(?(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
        if (match) {
            return {
                x: parseInt(match[1]),
                y: parseInt(match[2]),
                z: parseInt(match[3])
            };
        }
        return null;
    }

    updateServerStatsUI() {
        const fpsEl = document.getElementById('stat-fps');
        const playersEl = document.getElementById('stat-players');
        const uptimeEl = document.getElementById('stat-uptime');
        const entitiesEl = document.getElementById('stat-entities');
        
        if (fpsEl) fpsEl.innerText = this.serverStats.fps || '--';
        if (playersEl) playersEl.innerText = `${this.realPlayers.length}/${this.serverConfig.maxPlayers}`;
        if (uptimeEl) uptimeEl.innerText = this.serverStats.uptime || '--';
        if (entitiesEl) entitiesEl.innerText = this.serverStats.entities || '--';
    }

    async fetchPlayerStats(playerName) {
        if (!this.connected) return null;
        
        try {
            const health = await this.sendCommand(`player.stats ${playerName} health`);
            const hydration = await this.sendCommand(`player.stats ${playerName} hydration`);
            const food = await this.sendCommand(`player.stats ${playerName} food`);
            const radiation = await this.sendCommand(`player.stats ${playerName} radiation`);
            
            return {
                health: parseInt(health) || 0,
                hydration: parseInt(hydration) || 0,
                food: parseInt(food) || 0,
                radiation: parseInt(radiation) || 0
            };
        } catch (error) {
            console.error(`Failed to fetch stats for ${playerName}:`, error);
            return null;
        }
    }

    startRealTimeUpdates() {
        // Player list updates every 5 seconds - ONLY if connected
        this.refreshIntervals.set('players', setInterval(() => {
            if (this.connected) {
                this.fetchRealPlayers();
            }
        }, 5000));
        
        // Server stats updates every 10 seconds - ONLY if connected
        this.refreshIntervals.set('stats', setInterval(() => {
            if (this.connected) {
                this.fetchServerStats();
            }
        }, 10000));
        
        // Map updates every 30 seconds - ONLY if connected
        this.refreshIntervals.set('map', setInterval(() => {
            if (this.connected) {
                this.refreshMap();
            }
        }, 30000));
        
        console.log('📡 Real-time updates started - will only run when connected');
    }

    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * this.reconnectAttempts;
            
            console.log(`🔄 Reconnect scheduled in ${delay/1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                if (!this.connected && this.currentUser) {
                    this.connectToServer();
                }
            }, delay);
        } else {
            console.log('❌ Max reconnection attempts reached');
            this.showError('Unable to reconnect to server. Please try again later.');
        }
    }

    updateConnectionStatus(status, text) {
        const statusEl = document.getElementById('connection-status');
        
        if (statusEl) {
            statusEl.innerHTML = `<span class="dot ${status}"></span> ${text}`;
        }
        
        window.dispatchEvent(new CustomEvent('connection-changed', { 
            detail: { status, text } 
        }));
    }

    // ===== USER MANAGEMENT - REAL AUTHENTICATION ONLY =====
    
    async unlockDoor(code) {
        // Check master codes (hardcoded for security)
        if (code === this.accessCode || code === this.backupCode) {
            this.currentUser = 'CooseTheGeek';
            this.userLevel = 'master';
            this.saveSession();
            this.unlockDashboard();
            this.logAccess(this.currentUser, 'SUCCESS', code);
            this.showToast(`Welcome, ${this.currentUser}!`, 'success');
            
            // Auto-connect to server if profile is configured
            setTimeout(() => {
                if (this.serverConfig.ip && this.serverConfig.password) {
                    this.connectToServer();
                }
            }, 1000);
            
            return true;
        }
        
        // Check other users from secure storage
        const users = this.loadUsers();
        for (let [username, data] of Object.entries(users)) {
            if (data.code === code) {
                this.currentUser = username;
                this.userLevel = data.level || 'user';
                this.saveSession();
                this.unlockDashboard();
                this.logAccess(username, 'SUCCESS', code);
                this.showToast(`Welcome, ${username}!`, 'success');
                return true;
            }
        }
        
        // Failed attempt
        this.logAccess('UNKNOWN', 'FAILED', code);
        this.showError('Invalid access code');
        return false;
    }

    loadUsers() {
        try {
            const saved = localStorage.getItem('drained_users');
            if (saved) {
                return JSON.parse(saved);
            }
            // Default users - only master
            return {
                'CooseTheGeek': {
                    code: this.accessCode,
                    level: 'master',
                    created: new Date().toISOString(),
                    createdBy: 'system'
                }
            };
        } catch (e) {
            console.error('Failed to load users:', e);
            return {};
        }
    }

    saveUsers(users) {
        try {
            localStorage.setItem('drained_users', JSON.stringify(users));
        } catch (e) {
            console.error('Failed to save users:', e);
        }
    }

    logAccess(user, status, code) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            user: user,
            status: status,
            code: code ? '****' : '',
            ip: 'local'
        };
        
        let logs = [];
        try {
            const saved = localStorage.getItem('drained_access_logs');
            logs = saved ? JSON.parse(saved) : [];
        } catch (e) {
            logs = [];
        }
        
        logs.unshift(logEntry);
        if (logs.length > 100) logs.pop();
        
        try {
            localStorage.setItem('drained_access_logs', JSON.stringify(logs));
        } catch (e) {
            console.error('Failed to save access log:', e);
        }
        
        console.log(`🔐 Access ${status} for ${user}`);
    }

    signOut() {
        this.currentUser = null;
        this.userLevel = null;
        this.connected = false;
        this.connecting = false;
        this.realPlayers = [];
        
        localStorage.removeItem('drained_session');
        this.stopAllIntervals();
        this.showSecurityDoor();
        this.updateConnectionStatus('offline', 'DISCONNECTED');
        this.dispatchPlayerUpdate();
        
        console.log('👋 User signed out');
        this.showToast('Signed out successfully', 'info');
    }

    // ===== UTILITY METHODS =====
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) {
            console.log(`[${type}] ${message}`);
            return;
        }
        
        toast.innerText = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.className = 'toast hidden';
        }, 3000);
    }

    showError(message) {
        const modal = document.getElementById('error-modal');
        const msgEl = document.getElementById('error-message');
        
        if (!modal || !msgEl) {
            alert(`Error: ${message}`);
            return;
        }
        
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
        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-no');
        
        if (!modal || !msgEl || !yesBtn || !noBtn) {
            const result = confirm(message);
            callback(result);
            return;
        }
        
        msgEl.innerText = message;
        modal.classList.remove('hidden');
        
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
        return this.userLevel === 'owner' || this.isMaster();
    }

    formatUptime(seconds) {
        if (!seconds || seconds < 0) return '0d 0h 0m';
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    }

    formatNumber(num) {
        if (!num && num !== 0) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    sanitizeInput(input) {
        if (!input) return '';
        return input.replace(/[<>]/g, '');
    }

    // ===== MASTER CONTROL METHODS =====
    
    addUser(username, code, level, masterUser) {
        if (!this.isMaster() && masterUser !== 'CooseTheGeek') {
            this.showError('Only masters can add users');
            return false;
        }
        
        const users = this.loadUsers();
        
        if (users[username]) {
            this.showError('User already exists');
            return false;
        }
        
        if (!code || code.length !== 4 || !/^\d+$/.test(code)) {
            this.showError('Code must be 4 digits');
            return false;
        }
        
        users[username] = {
            code: code,
            level: level || 'user',
            created: new Date().toISOString(),
            createdBy: masterUser
        };
        
        this.saveUsers(users);
        this.logAccess(masterUser, 'USER_ADDED', '');
        this.showToast(`User ${username} added`, 'success');
        return true;
    }

    removeUser(username, masterUser) {
        if (!this.isMaster() && masterUser !== 'CooseTheGeek') {
            this.showError('Only masters can remove users');
            return false;
        }
        
        if (username === 'CooseTheGeek') {
            this.showError('Cannot remove primary master');
            return false;
        }
        
        const users = this.loadUsers();
        
        if (!users[username]) {
            this.showError('User not found');
            return false;
        }
        
        delete users[username];
        this.saveUsers(users);
        this.logAccess(masterUser, 'USER_REMOVED', '');
        this.showToast(`User ${username} removed`, 'info');
        return true;
    }

    changeUserCode(username, newCode, masterUser) {
        if (!this.isMaster() && masterUser !== 'CooseTheGeek') {
            this.showError('Only masters can change codes');
            return false;
        }
        
        const users = this.loadUsers();
        
        if (!users[username]) {
            this.showError('User not found');
            return false;
        }
        
        if (!newCode || newCode.length !== 4 || !/^\d+$/.test(newCode)) {
            this.showError('Code must be 4 digits');
            return false;
        }
        
        users[username].code = newCode;
        this.saveUsers(users);
        this.logAccess(masterUser, 'CODE_CHANGED', '');
        this.showToast(`Code changed for ${username}`, 'success');
        return true;
    }

    getAccessLogs() {
        try {
            const saved = localStorage.getItem('drained_access_logs');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    clearAccessLogs(masterUser) {
        if (!this.isMaster() && masterUser !== 'CooseTheGeek') {
            this.showError('Only masters can clear logs');
            return false;
        }
        
        localStorage.removeItem('drained_access_logs');
        this.logAccess(masterUser, 'LOGS_CLEARED', '');
        this.showToast('Access logs cleared', 'info');
        return true;
    }

    // ===== EXPORT METHODS =====
    
    exportUserData() {
        if (!this.isMaster()) {
            this.showError('Master access required');
            return;
        }
        
        const users = this.loadUsers();
        const logs = this.getAccessLogs();
        
        const data = {
            users: users,
            logs: logs,
            exported: new Date().toISOString(),
            exportedBy: this.currentUser
        };
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `drained-users-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        
        this.showToast('User data exported', 'success');
    }

    importUserData(file, masterUser) {
        if (!this.isMaster() && masterUser !== 'CooseTheGeek') {
            this.showError('Only masters can import data');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.users) {
                    this.saveUsers(data.users);
                    this.showToast('Users imported successfully', 'success');
                } else {
                    this.showError('Invalid import file');
                }
            } catch (err) {
                this.showError('Failed to parse import file');
            }
        };
        reader.readAsText(file);
    }

    // ===== PROFILE MANAGEMENT =====
    
    saveProfile(profileData) {
        try {
            const profiles = this.loadProfiles();
            profiles[this.currentUser] = {
                ...profileData,
                updated: new Date().toISOString()
            };
            localStorage.setItem('drained_profiles', JSON.stringify(profiles));
            this.showToast('Profile saved', 'success');
        } catch (e) {
            console.error('Failed to save profile:', e);
            this.showError('Could not save profile');
        }
    }

    loadProfiles() {
        try {
            const saved = localStorage.getItem('drained_profiles');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    getCurrentProfile() {
        const profiles = this.loadProfiles();
        return profiles[this.currentUser] || null;
    }

    // ===== BACKUP/RESTORE METHODS =====
    
    createBackup(includeUsers = true, includeSettings = true, includeLogs = true) {
        const backup = {
            timestamp: new Date().toISOString(),
            version: this.version,
            createdBy: this.currentUser
        };
        
        if (includeUsers) backup.users = this.loadUsers();
        if (includeSettings) backup.settings = {
            accessCode: this.accessCode,
            serverConfig: this.serverConfig
        };
        if (includeLogs) backup.logs = this.getAccessLogs();
        
        return backup;
    }

    exportBackup(backup) {
        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `drained-backup-${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`;
        a.click();
        this.showToast('Backup exported', 'success');
    }

    restoreBackup(backupData, masterUser) {
        if (!this.isMaster() && masterUser !== 'CooseTheGeek') {
            this.showError('Only masters can restore backups');
            return false;
        }
        
        try {
            if (backupData.users) this.saveUsers(backupData.users);
            if (backupData.settings) {
                if (backupData.settings.accessCode) this.accessCode = backupData.settings.accessCode;
                if (backupData.settings.serverConfig) {
                    this.serverConfig = { ...this.serverConfig, ...backupData.settings.serverConfig };
                }
            }
            if (backupData.logs) localStorage.setItem('drained_access_logs', JSON.stringify(backupData.logs));
            
            this.showToast('Backup restored successfully', 'success');
            return true;
        } catch (e) {
            console.error('Failed to restore backup:', e);
            this.showError('Could not restore backup');
            return false;
        }
    }

    // ===== EVENT EMITTER SYSTEM =====
    
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.eventListeners.has(event)) return;
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index !== -1) listeners.splice(index, 1);
    }

    emit(event, data) {
        if (!this.eventListeners.has(event)) return;
        this.eventListeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (e) {
                console.error(`Error in event listener for ${event}:`, e);
            }
        });
    }

    // ===== CLEANUP =====
    
    destroy() {
        this.stopAllIntervals();
        this.eventListeners.clear();
        this.pendingCommands.clear();
        console.log('🧹 Core engine cleaned up');
    }
}

// ===== GLOBAL SAFETY NET =====
window.addEventListener('error', (event) => {
    console.error('💥 Uncaught global error:', event.error);
    // Try to show security door
    const door = document.getElementById('security-door');
    const dashboard = document.getElementById('dashboard');
    if (door && dashboard) {
        door.style.display = 'flex';
        dashboard.classList.remove('visible');
    }
    // Show error toast
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = 'A temporary error occurred. Please refresh.';
        toast.className = 'toast show error';
        setTimeout(() => toast.className = 'toast hidden', 5000);
    }
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.drainedTablet = new DrainedTablet();
    } catch (error) {
        console.error('❌ Failed to create DrainedTablet:', error);
        const door = document.getElementById('security-door');
        if (door) door.style.display = 'flex';
    }
    
    const errorClose = document.getElementById('error-close');
    if (errorClose) {
        errorClose.addEventListener('click', () => {
            document.getElementById('error-modal').classList.add('hidden');
        });
    }
    
    const confirmNo = document.getElementById('confirm-no');
    if (confirmNo) {
        confirmNo.addEventListener('click', () => {
            document.getElementById('confirm-modal').classList.add('hidden');
        });
    }
    
    console.log('🚀 DRAINED TABLET loaded and ready');
});

// ===== EXPOSE GLOBAL HELPERS =====
window.formatUptime = (seconds) => {
    if (!seconds || seconds < 0) return '0d 0h 0m';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
};

window.formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

window.sanitizeInput = (input) => {
    if (!input) return '';
    return input.replace(/[<>]/g, '');
};
