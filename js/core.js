// core.js – DRAINED TABLET ULTIMATE v7.0.0
// Defines global AppState, ConnectionManager, UserManager, LayoutManager, utilities.

// ========================= GLOBAL STATE =========================
window.AppState = {
    user: {
        username: localStorage.getItem('tdl_username') || null,
        role: localStorage.getItem('tdl_role') || null,
        platform: localStorage.getItem('tdl_platform') || null,
        avatar: localStorage.getItem('tdl_avatar') || null,
        platformId: localStorage.getItem('tdl_platform_id') || null,
        settings: JSON.parse(localStorage.getItem('tdl_settings') || '{}')
    },
    connection: {
        status: 'disconnected',
        server: null,
        bridgeUrl: 'https://drained-bridge.onrender.com',
        lastPing: null,
        reconnectAttempts: 0,
        maxReconnect: 5,
        error: null
    },
    layout: JSON.parse(localStorage.getItem('tdl_layout') || 'null'),
    combatLogs: [],
    players: [],
    serverStats: {
        fps: 0,
        cpu: 0,
        memory: 0,
        uptime: '0d 0h 0m',
        entities: 0
    },
    listeners: []
};

// ========================= CONNECTION MANAGEMENT =========================
window.ConnectionManager = {
    async checkHealth() {
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/health`);
            if (!res.ok) throw new Error('Bridge unreachable');
            await res.json();
            AppState.connection.status = 'connected';
            AppState.connection.lastPing = Date.now();
            AppState.connection.error = null;
            this.notify();
            return true;
        } catch (err) {
            AppState.connection.status = 'error';
            AppState.connection.error = err.message;
            this.notify();
            return false;
        }
    },

    async connect(credentials) {
        AppState.connection.status = 'connecting';
        this.notify();
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/connect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Connection failed');
            AppState.connection.status = 'connected';
            AppState.connection.server = data.server;
            AppState.connection.lastPing = Date.now();
            AppState.connection.reconnectAttempts = 0;
            AppState.connection.error = null;
            localStorage.setItem('tdl_last_connected', new Date().toISOString());
            localStorage.setItem('tdl_last_credentials', JSON.stringify(credentials));
            this.notify();
            return true;
        } catch (err) {
            AppState.connection.status = 'error';
            AppState.connection.error = err.message;
            this.notify();
            return false;
        }
    },

    disconnect() {
        AppState.connection.status = 'disconnected';
        AppState.connection.server = null;
        AppState.connection.lastPing = null;
        AppState.players = [];
        this.notify();
    },

    async executeCommand(command) {
        if (AppState.connection.status !== 'connected' || !AppState.connection.server) {
            throw new Error('Not connected to any server');
        }
        const { ip, port, password } = AppState.connection.server;
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ip, port, password, command })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Command failed');
            return data.result;
        } catch (err) {
            throw err;
        }
    },

    async autoReconnect() {
        if (AppState.connection.status === 'connected') return;
        if (AppState.connection.reconnectAttempts >= AppState.connection.maxReconnect) {
            AppState.connection.status = 'disconnected';
            this.notify();
            return;
        }
        const lastCreds = localStorage.getItem('tdl_last_credentials');
        if (!lastCreds) return;
        try {
            AppState.connection.reconnectAttempts++;
            await this.connect(JSON.parse(lastCreds));
        } catch (e) {
            setTimeout(() => this.autoReconnect(), 2000 * AppState.connection.reconnectAttempts);
        }
    },

    notify() {
        AppState.listeners.forEach(fn => fn());
        // Also update UI status indicators
        const statusDot = document.querySelector('#connection-status .dot');
        const statusText = document.getElementById('conn-status-text');
        if (statusDot && statusText) {
            if (AppState.connection.status === 'connected') {
                statusDot.className = 'dot online';
                statusText.innerText = 'CONNECTED';
            } else if (AppState.connection.status === 'connecting') {
                statusDot.className = 'dot connecting';
                statusText.innerText = 'CONNECTING...';
            } else {
                statusDot.className = 'dot offline';
                statusText.innerText = 'DISCONNECTED';
            }
        }
    },

    subscribe(listener) {
        AppState.listeners.push(listener);
        return () => {
            AppState.listeners = AppState.listeners.filter(l => l !== listener);
        };
    }
};

// ========================= USER MANAGEMENT =========================
window.UserManager = {
    setUser(userData) {
        AppState.user = { ...AppState.user, ...userData };
        if (userData.username) localStorage.setItem('tdl_username', userData.username);
        if (userData.role) localStorage.setItem('tdl_role', userData.role);
        if (userData.platform) localStorage.setItem('tdl_platform', userData.platform);
        if (userData.avatar) localStorage.setItem('tdl_avatar', userData.avatar);
        if (userData.platformId) localStorage.setItem('tdl_platform_id', userData.platformId);
        ConnectionManager.notify();
    },

    logout() {
        localStorage.removeItem('tdl_username');
        localStorage.removeItem('tdl_role');
        localStorage.removeItem('tdl_platform');
        localStorage.removeItem('tdl_avatar');
        localStorage.removeItem('tdl_platform_id');
        localStorage.removeItem('tdl_last_credentials');
        AppState.user = { username: null, role: null, platform: null, avatar: null, platformId: null, settings: {} };
        ConnectionManager.disconnect();
        const securityDoor = document.getElementById('security-door');
        const dashboard = document.getElementById('dashboard');
        if (securityDoor) securityDoor.classList.remove('hidden');
        if (dashboard) dashboard.classList.add('hidden');
    },

    hasRole(minRole) {
        const roles = ['user', 'master', 'owner'];
        const userIdx = roles.indexOf(AppState.user.role);
        const minIdx = roles.indexOf(minRole);
        return userIdx >= minIdx;
    },

    saveSettings(settings) {
        AppState.user.settings = settings;
        localStorage.setItem('tdl_settings', JSON.stringify(settings));
        ConnectionManager.notify();
    }
};

// ========================= LAYOUT MANAGEMENT =========================
window.LayoutManager = {
    saveLayout(layout) {
        AppState.layout = layout;
        localStorage.setItem('tdl_layout', JSON.stringify(layout));
        ConnectionManager.notify();
    },
    loadLayout() { return AppState.layout; },
    resetLayout() {
        localStorage.removeItem('tdl_layout');
        AppState.layout = null;
        ConnectionManager.notify();
    }
};

// ========================= UTILITIES =========================
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

window.drainedTablet = {
    showToast: function(msg, type) {
        if (window.toast) window.toast.show(msg, type);
        else console.log(`[Toast] ${type}: ${msg}`);
    },
    showError: function(msg) {
        if (window.toast) window.toast.error(msg);
        else console.error(msg);
    },
    connected: false,
    serverConfig: {
        ip: null, port: null, password: null,
        name: 'The Drained Land\'s 2X',
        mapSize: 3500,
        mapSeed: 10325
    }
};

console.log('🚀 DRAINED TABLET core loaded');