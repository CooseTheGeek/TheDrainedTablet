// core.js – DRAINED TABLET ULTIMATE v7.0.0 (GPortal API ready)

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

window.ConnectionManager = {
    async checkHealth() {
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/health`);
            if (!res.ok) throw new Error('Bridge unreachable');
            const data = await res.json();
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

    async executeCommand(command) {
        // Use GPortal API if the connector is ready
        if (window.gportalConnector && window.gportalConnector.apiReady) {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/gportal/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command })
            });
            const data = await res.json();
            if (data.success) return data.result;
            throw new Error(data.error || 'GPortal command failed');
        }

        // Fallback to legacy RCON (if ever needed)
        if (AppState.connection.status !== 'connected' || !AppState.connection.server) {
            throw new Error('Not connected to any server');
        }
        const { ip, port, password } = AppState.connection.server;
        const res = await fetch(`${AppState.connection.bridgeUrl}/api/command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip, port, password, command })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Command failed');
        return data.result;
    },

    notify() {
        AppState.listeners.forEach(fn => fn());
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

// GPortal player list polling (use the GPortal command endpoint)
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
                let raw = data.result;
                if (Array.isArray(raw)) {
                    players = raw.map(p => ({
                        name: p.DisplayName || p.displayName || p.name || 'Unknown'
                    }));
                } else if (typeof raw === 'string') {
                    // Attempt to parse as JSON if it's a stringified array
                    try {
                        const parsed = JSON.parse(raw);
                        if (Array.isArray(parsed)) {
                            players = parsed.map(p => ({
                                name: p.DisplayName || p.displayName || p.name || 'Unknown'
                            }));
                        }
                    } catch(e) {
                        // Fallback: split by newline
                        const lines = raw.split('\n').filter(l => l.trim());
                        players = lines.map(line => {
                            // Try to extract name: often format like "Name (STEAM_...)"
                            const match = line.match(/^([^\(]+)/);
                            return { name: match ? match[1].trim() : line.trim() };
                        });
                    }
                }
            }
            AppState.players = players;
            window.dispatchEvent(new CustomEvent('players-updated', { detail: { players } }));
            ConnectionManager.notify();
        } catch (err) {
            console.error('Error polling player list:', err);
        }
    }
}, 15000);

window.drainedTablet = {
    showToast: (msg, type) => { if (window.toast) window.toast.show(msg, type); else console.log(`[Toast] ${type}: ${msg}`); },
    showError: (msg) => { if (window.toast) window.toast.error(msg); else console.error(msg); },
    connected: false,
    serverConfig: { ip: null, port: null, password: null, name: 'The Drained Land\'s 2X', mapSize: 3500, mapSeed: 10325 }
};

console.log('🚀 DRAINED TABLET core loaded');