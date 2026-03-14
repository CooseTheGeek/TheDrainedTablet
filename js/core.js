// core.js – DRAINED TABLET ULTIMATE v7.0.0 (final with robust player list polling)

// ========================= GLOBAL STATE =========================
const AppState = {
    user: {
        username: localStorage.getItem('tdl_username') || null,
        role: localStorage.getItem('tdl_role') || null,
        platform: localStorage.getItem('tdl_platform') || null,
        avatar: localStorage.getItem('tdl_avatar') || null,
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
const ConnectionManager = {
    async checkHealth() {
        console.log('📡 Checking bridge health...');
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/health`);
            console.log('📥 Health response status:', res.status);
            if (!res.ok) throw new Error('Bridge unreachable');
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

    async connect(credentials) {
        console.log('🔌 Attempting to connect with credentials:', { ip: credentials.ip, port: credentials.port, password: '***' });
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
            if (!data.success) throw new Error(data.error || 'Connection failed');
            console.log('✅ Connection successful, server:', data.server);
            AppState.connection.status = 'connected';
            AppState.connection.server = data.server;
            AppState.connection.lastPing = Date.now();
            AppState.connection.reconnectAttempts = 0;
            AppState.connection.error = null;
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

    disconnect() {
        console.log('🔌 Disconnecting from server');
        AppState.connection.status = 'disconnected';
        AppState.connection.server = null;
        AppState.connection.lastPing = null;
        AppState.players = [];
        this.notify();
    },

    async executeCommand(command) {
        console.log('⚡ Executing RCON command:', command);
        
        if (window.gportalConnector && window.gportalConnector.apiReady) {
            console.log('Using GPortal API for command');
            try {
                const res = await fetch(`${AppState.connection.bridgeUrl}/api/gportal/command`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ command })
                });
                const data = await res.json();
                if (data.success) {
                    return data.result || 'Command executed (no output)';
                } else {
                    throw new Error(data.error || 'GPortal command failed');
                }
            } catch (err) {
                console.error('GPortal command error:', err);
                throw err;
            }
        }

        if (AppState.connection.status !== 'connected') {
            console.error('❌ Not connected to any server (old RCON)');
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
            if (!data.success) throw new Error(data.error || 'Command execution failed');
            console.log('✅ Command executed successfully');
            return data.result;
        } catch (err) {
            console.error('🔥 Exception in executeCommand:', err.message);
            throw err;
        }
    },

    async autoReconnect() {
        console.log('🔄 Auto-reconnect attempt', AppState.connection.reconnectAttempts + 1);
        if (AppState.connection.status === 'connected') return;
        if (AppState.connection.reconnectAttempts >= AppState.connection.maxReconnect) {
            console.log('⏹️ Max reconnect attempts reached');
            AppState.connection.status = 'disconnected';
            this.notify();
            return;
        }
        const lastCreds = localStorage.getItem('tdl_last_credentials');
        if (!lastCreds) return;
        try {
            AppState.connection.reconnectAttempts++;
            console.log('🔄 Attempt', AppState.connection.reconnectAttempts);
            await this.connect(JSON.parse(lastCreds));
        } catch (e) {
            console.log('⏱️ Reconnect failed, scheduling next attempt');
            setTimeout(() => this.autoReconnect(), 2000 * AppState.connection.reconnectAttempts);
        }
    },

    notify() {
        AppState.listeners.forEach(fn => fn());
    },

    subscribe(listener) {
        AppState.listeners.push(listener);
        return () => {
            AppState.listeners = AppState.listeners.filter(l => l !== listener);
        };
    }
};

// ========================= USER MANAGEMENT =========================
const UserManager = {
    setUser(userData) {
        AppState.user = { ...AppState.user, ...userData };
        if (userData.username) localStorage.setItem('tdl_username', userData.username);
        if (userData.role) localStorage.setItem('tdl_role', userData.role);
        if (userData.platform) localStorage.setItem('tdl_platform', userData.platform);
        if (userData.avatar) localStorage.setItem('tdl_avatar', userData.avatar);
        ConnectionManager.notify();
    },

    logout() {
        localStorage.removeItem('tdl_username');
        localStorage.removeItem('tdl_role');
        localStorage.removeItem('tdl_platform');
        localStorage.removeItem('tdl_avatar');
        localStorage.removeItem('tdl_last_credentials');
        AppState.user = { username: null, role: null, platform: null, avatar: null, settings: {} };
        ConnectionManager.disconnect();
        document.getElementById('security-door')?.classList.remove('hidden');
        document.getElementById('dashboard')?.classList.add('hidden');
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
const LayoutManager = {
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

// ========================= PLATFORM ICONS =========================
const PlatformIcons = {
    ps5: '<svg class="platform-icon ps5" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="12" cy="12" r="3"/></svg>',
    xbox: '<svg class="platform-icon xbox" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><rect x="9" y="9" width="6" height="6"/></svg>'
};

// ========================= EXPORT =========================
window.AppState = AppState;
window.ConnectionManager = ConnectionManager;
window.UserManager = UserManager;
window.LayoutManager = LayoutManager;
window.PlatformIcons = PlatformIcons;

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

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DRAINED TABLET core loaded');
});

// ========================= GPortal Player List Polling (Reliable) =========================
setInterval(async () => {
    if (window.gportalConnector && window.gportalConnector.apiReady) {
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/gportal/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: 'playerlist' })
            });
            const data = await res.json();
            let players = [];

            if (data.success && data.result) {
                const raw = data.result;
                console.log('Raw playerlist response:', raw); // for debugging

                // If it's a string, assume one name per line
                if (typeof raw === 'string') {
                    const lines = raw.split('\n').filter(l => l.trim() && !l.includes('ID') && !l.includes('connected'));
                    players = lines.map(name => ({
                        name: name.trim(),
                        online: true,
                        playtime: 'N/A',
                        position: null
                    }));
                } else if (Array.isArray(raw)) {
                    players = raw.map(p => ({
                        name: String(p.name || p.displayName || p),
                        online: true,
                        playtime: p.playtime || 'N/A',
                        position: p.position || null
                    }));
                }
            }

            AppState.players = players;
            ConnectionManager.notify();
        } catch (err) {
            console.error('Error polling player list:', err);
        }
    }
}, 15000);