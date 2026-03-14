// core.js – DRAINED TABLET ULTIMATE v7.0.0
// Global state, connection management, user authentication, and shared utilities.
// NO MOCK DATA – all data comes from live RCON or bridge.

// ========================= GLOBAL STATE =========================
const AppState = {
    user: {
        username: localStorage.getItem('tdl_username') || null,
        role: localStorage.getItem('tdl_role') || null,          // 'user', 'master', 'owner'
        platform: localStorage.getItem('tdl_platform') || null,  // 'ps5', 'xbox', null
        avatar: localStorage.getItem('tdl_avatar') || null,
        settings: JSON.parse(localStorage.getItem('tdl_settings') || '{}')
    },
    connection: {
        status: 'disconnected',       // 'disconnected', 'connecting', 'connected', 'error'
        server: null,                  // { ip, port, password }
        bridgeUrl: 'https://drained-bridge.onrender.com',   // CHANGE THIS
        lastPing: null,
        reconnectAttempts: 0,
        maxReconnect: 5,
        error: null
    },
    layout: JSON.parse(localStorage.getItem('tdl_layout') || 'null'),
    combatLogs: [],                    // cache of combat logs for current player
    players: [],                        // real online players from RCON
    serverStats: {
        fps: 0,
        cpu: 0,
        memory: 0,
        uptime: '0d 0h 0m',
        entities: 0
    },
    listeners: []                       // event subscribers
};

// ========================= CONNECTION MANAGEMENT =========================
const ConnectionManager = {
    // Check bridge health
    async checkHealth() {
        console.log('📡 Checking bridge health...');
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/health`);
            console.log('📥 Health response status:', res.status);
            if (!res.ok) {
                console.error('❌ Bridge unreachable, status:', res.status);
                throw new Error('Bridge unreachable');
            }
            const data = await res.json();
            console.log('✅ Bridge health OK:', data);
            AppState.connection.status = 'connected';
            AppState.connection.lastPing = Date.now();
            AppState.connection.error = null;
            this.notify();
            return true;
        } catch (err) {
            console.error('🔥 Health check error:', err.message);
            AppState.connection.status = 'error';
            AppState.connection.error = err.message;
            this.notify();
            return false;
        }
    },

    // Connect to server using credentials
    async connect(credentials) {
        console.log('🔌 Attempting to connect with credentials:', { 
            ip: credentials.ip, 
            port: credentials.port, 
            password: '***' // hide password in logs
        });

        AppState.connection.status = 'connecting';
        this.notify();

        try {
            const url = `${AppState.connection.bridgeUrl}/api/connect`;
            console.log('📡 Sending POST request to:', url);
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            console.log('📥 Response status:', res.status);
            const data = await res.json();
            console.log('📦 Response data:', data);

            if (!data.success) {
                console.error('❌ Connection failed:', data.error);
                throw new Error(data.error || 'Connection failed');
            }

            console.log('✅ Connection successful, server:', data.server);
            AppState.connection.status = 'connected';
            AppState.connection.server = data.server;
            AppState.connection.lastPing = Date.now();
            AppState.connection.reconnectAttempts = 0;
            AppState.connection.error = null;
            // Store credentials only if user opts to remember (handled in Profile tab)
            localStorage.setItem('tdl_last_connected', new Date().toISOString());
            this.notify();
            return true;
        } catch (err) {
            console.error('🔥 Exception in connect():', err.message);
            if (err.stack) console.error('Stack:', err.stack);
            AppState.connection.status = 'error';
            AppState.connection.error = err.message;
            this.notify();
            return false;
        }
    },

    // Disconnect (does not close bridge, just marks state)
    disconnect() {
        console.log('🔌 Disconnecting from server');
        AppState.connection.status = 'disconnected';
        AppState.connection.server = null;
        AppState.connection.lastPing = null;
        AppState.players = [];
        this.notify();
    },

    // Execute an RCON command
    async executeCommand(command) {
        console.log('⚡ Executing RCON command:', command);
        if (AppState.connection.status !== 'connected') {
            console.error('❌ Not connected to any server');
            throw new Error('Not connected to any server');
        }

        try {
            const url = `${AppState.connection.bridgeUrl}/api/command`;
            console.log('📡 Sending command to:', url);
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ip: AppState.connection.server.ip,
                    port: AppState.connection.server.port,
                    password: AppState.connection.server.password,
                    command
                })
            });
            console.log('📥 Command response status:', res.status);
            const data = await res.json();
            console.log('📦 Command response data:', data);

            if (!data.success) {
                console.error('❌ Command execution failed:', data.error);
                throw new Error(data.error || 'Command execution failed');
            }
            console.log('✅ Command executed successfully');
            return data.result;
        } catch (err) {
            console.error('🔥 Exception in executeCommand:', err.message);
            throw err;
        }
    },

    // Auto‑reconnect with exponential backoff
    async autoReconnect() {
        console.log('🔄 Auto-reconnect attempt', AppState.connection.reconnectAttempts + 1);
        if (AppState.connection.status === 'connected') {
            console.log('✅ Already connected');
            return;
        }
        if (AppState.connection.reconnectAttempts >= AppState.connection.maxReconnect) {
            console.log('⏹️ Max reconnect attempts reached');
            AppState.connection.status = 'disconnected';
            this.notify();
            return;
        }
        // Attempt to reconnect with stored credentials (if any)
        const lastCreds = localStorage.getItem('tdl_last_credentials');
        if (!lastCreds) {
            console.log('❌ No stored credentials for reconnect');
            return;
        }
        try {
            AppState.connection.reconnectAttempts++;
            console.log('🔄 Attempt', AppState.connection.reconnectAttempts);
            await this.connect(JSON.parse(lastCreds));
        } catch (e) {
            console.log('⏱️ Reconnect failed, scheduling next attempt');
            setTimeout(() => this.autoReconnect(), 2000 * AppState.connection.reconnectAttempts);
        }
    },

    // Notify all subscribers of state change
    notify() {
        AppState.listeners.forEach(fn => fn());
    },

    // Subscribe to state changes
    subscribe(listener) {
        AppState.listeners.push(listener);
        return () => {
            AppState.listeners = AppState.listeners.filter(l => l !== listener);
        };
    }
};

// ========================= USER MANAGEMENT =========================
const UserManager = {
    // Set user data after login
    setUser(userData) {
        AppState.user = { ...AppState.user, ...userData };
        if (userData.username) localStorage.setItem('tdl_username', userData.username);
        if (userData.role) localStorage.setItem('tdl_role', userData.role);
        if (userData.platform) localStorage.setItem('tdl_platform', userData.platform);
        if (userData.avatar) localStorage.setItem('tdl_avatar', userData.avatar);
        ConnectionManager.notify();
    },

    // Log out (clear session)
    logout() {
        localStorage.removeItem('tdl_username');
        localStorage.removeItem('tdl_role');
        localStorage.removeItem('tdl_platform');
        localStorage.removeItem('tdl_avatar');
        localStorage.removeItem('tdl_last_credentials');
        AppState.user = { username: null, role: null, platform: null, avatar: null, settings: {} };
        ConnectionManager.disconnect();
        // Optionally redirect to security door
        document.getElementById('security-door')?.classList.remove('hidden');
        document.getElementById('dashboard')?.classList.add('hidden');
    },

    // Check if current user has at least the given role (user, master, owner)
    hasRole(minRole) {
        const roles = ['user', 'master', 'owner'];
        const userIdx = roles.indexOf(AppState.user.role);
        const minIdx = roles.indexOf(minRole);
        return userIdx >= minIdx;
    },

    // Save settings for current user
    saveSettings(settings) {
        AppState.user.settings = settings;
        localStorage.setItem('tdl_settings', JSON.stringify(settings));
        ConnectionManager.notify();
    }
};

// ========================= LAYOUT MANAGEMENT (Drag‑Drop) =========================
const LayoutManager = {
    saveLayout(layout) {
        AppState.layout = layout;
        localStorage.setItem('tdl_layout', JSON.stringify(layout));
        ConnectionManager.notify();
    },

    loadLayout() {
        return AppState.layout;
    },

    resetLayout() {
        localStorage.removeItem('tdl_layout');
        AppState.layout = null;
        ConnectionManager.notify();
    }
};

// ========================= PLATFORM ICONS (PlayStation / Xbox) =========================
const PlatformIcons = {
    ps5: '<svg class="platform-icon ps5" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="12" cy="12" r="3"/></svg>',
    xbox: '<svg class="platform-icon xbox" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><rect x="9" y="9" width="6" height="6"/></svg>'
};

// ========================= EXPORT GLOBALLY =========================
window.AppState = AppState;
window.ConnectionManager = ConnectionManager;
window.UserManager = UserManager;
window.LayoutManager = LayoutManager;
window.PlatformIcons = PlatformIcons;

// ========================= UTILITY FUNCTIONS =========================
function formatUptime(seconds) {
    if (!seconds || seconds < 0) return '0d 0h 0m';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
}

function formatNumber(num) {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function sanitizeInput(input) {
    if (!input) return '';
    return input.replace(/[<>]/g, '');
}

// ========================= INITIALIZATION =========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DRAINED TABLET core loaded');
    // Check for saved session? Handled by security door.
});