// console.js – DRAINED TABLET ULTIMATE v7.0.0
// Live RCON console with WebSocket streaming, tabs, auto‑complete, and command history.
// Displays real‑time server output and allows command input.

class Console {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.socket = null;
        this.history = this.loadHistory();
        this.historyIndex = -1;
        this.commands = []; // auto‑complete suggestions
        this.init();
    }

    loadHistory() {
        const saved = localStorage.getItem('tdl_console_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveHistory() {
        localStorage.setItem('tdl_console_history', JSON.stringify(this.history.slice(0, 50)));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.connectWebSocket();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'console') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-console');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="console-container">
                <div class="console-header">
                    <h2>🖥️ RCON CONSOLE</h2>
                    <div class="console-tabs">
                        <button class="console-tab active" data-view="server">SERVER</button>
                        <button class="console-tab" data-view="rcon">RCON</button>
                        <button class="console-tab" data-view="logs">LIVE LOGS</button>
                        <button class="console-tab" data-view="perf">PERFORMANCE</button>
                    </div>
                </div>
                <div class="console-view" id="console-view-server">
                    <div class="console-output" id="console-output"></div>
                    <div class="console-input-area">
                        <span class="prompt">></span>
                        <input type="text" id="console-input" placeholder="Enter command...">
                        <button id="console-send" class="console-btn">SEND</button>
                    </div>
                </div>
                <div class="console-view" id="console-view-rcon" style="display:none;">
                    <div class="console-output" id="rcon-output"></div>
                    <div class="console-input-area">
                        <span class="prompt">RCON></span>
                        <input type="text" id="rcon-input" placeholder="Enter RCON command...">
                        <button id="rcon-send" class="console-btn">SEND</button>
                    </div>
                </div>
                <div class="console-view" id="console-view-logs" style="display:none;">
                    <div class="console-output" id="logs-output"></div>
                    <div class="log-filters">
                        <label><input type="checkbox" class="log-filter" value="info" checked> Info</label>
                        <label><input type="checkbox" class="log-filter" value="warn" checked> Warn</label>
                        <label><input type="checkbox" class="log-filter" value="error" checked> Error</label>
                        <label><input type="checkbox" class="log-filter" value="chat" checked> Chat</label>
                    </div>
                </div>
                <div class="console-view" id="console-view-perf" style="display:none;">
                    <canvas id="perf-canvas" width="800" height="200"></canvas>
                </div>
            </div>
        `;

        this.attachTabListeners();
    }

    attachEvents() {
        document.getElementById('console-send')?.addEventListener('click', () => this.sendCommand('server'));
        document.getElementById('rcon-send')?.addEventListener('click', () => this.sendCommand('rcon'));
        document.getElementById('console-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendCommand('server');
        });
        document.getElementById('rcon-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendCommand('rcon');
        });

        // Command history navigation
        document.getElementById('console-input')?.addEventListener('keydown', (e) => this.handleHistory(e, 'console-input'));
        document.getElementById('rcon-input')?.addEventListener('keydown', (e) => this.handleHistory(e, 'rcon-input'));

        // Log filters
        document.querySelectorAll('.log-filter').forEach(cb => {
            cb.addEventListener('change', () => this.filterLogs());
        });
    }

    attachTabListeners() {
        document.querySelectorAll('.console-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.console-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.console-view').forEach(v => v.style.display = 'none');
                e.target.classList.add('active');
                const view = e.target.dataset.view;
                document.getElementById(`console-view-${view}`).style.display = 'block';
                if (view === 'perf') this.drawPerfChart();
            });
        });
    }

    connectWebSocket() {
        if (!this.access.hasRole('master')) return;
        // Use the bridge WebSocket endpoint
        const wsUrl = AppState.connection.bridgeUrl.replace('http', 'ws') + '/ws';
        this.socket = new WebSocket(wsUrl);
        this.socket.onopen = () => {
            this.addLine('system', 'WebSocket connected');
            // Subscribe to server output
            if (AppState.connection.server) {
                this.socket.send(JSON.stringify({
                    type: 'subscribe',
                    ip: AppState.connection.server.ip,
                    port: AppState.connection.server.port,
                    password: AppState.connection.server.password
                }));
            }
        };
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleIncoming(data);
        };
        this.socket.onclose = () => {
            this.addLine('system', 'WebSocket disconnected – reconnecting...');
            setTimeout(() => this.connectWebSocket(), 5000);
        };
    }

    handleIncoming(data) {
        if (data.type === 'output') {
            this.addLine('server', data.message, data.level);
        } else if (data.type === 'chat') {
            this.addLine('chat', `[CHAT] ${data.player}: ${data.message}`, 'chat');
        } else if (data.type === 'command-result') {
            this.addLine('rcon', data.result, 'output');
        } else if (data.type === 'error') {
            this.addLine('system', `Error: ${data.message}`, 'error');
        }
    }

    addLine(source, text, level = 'info') {
        const outputDiv = source === 'rcon' ? document.getElementById('rcon-output') : document.getElementById('console-output');
        if (!outputDiv) return;
        const line = document.createElement('div');
        line.className = `console-line ${level}`;
        const time = new Date().toLocaleTimeString();
        line.innerHTML = `<span class="timestamp">[${time}]</span> ${text}`;
        outputDiv.appendChild(line);
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }

    async sendCommand(type) {
        const inputId = type === 'server' ? 'console-input' : 'rcon-input';
        const input = document.getElementById(inputId);
        const cmd = input.value.trim();
        if (!cmd) return;

        this.addLine(type, `> ${cmd}`, 'input');
        this.history.unshift(cmd);
        this.saveHistory();
        input.value = '';

        try {
            const result = await ConnectionManager.executeCommand(cmd);
            this.addLine(type, result, 'output');
        } catch (err) {
            this.addLine(type, `Error: ${err.message}`, 'error');
        }
    }

    handleHistory(e, inputId) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.historyIndex = Math.min(this.historyIndex + 1, this.history.length - 1);
            document.getElementById(inputId).value = this.history[this.historyIndex] || '';
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.historyIndex = Math.max(this.historyIndex - 1, -1);
            document.getElementById(inputId).value = this.historyIndex >= 0 ? this.history[this.historyIndex] : '';
        }
    }

    filterLogs() {
        // Implementation for filtering logs (if logs are stored)
    }

    drawPerfChart() {
        const canvas = document.getElementById('perf-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        // Draw simple performance graph – in a real implementation, fetch historical data
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFB100';
        ctx.font = '12px monospace';
        ctx.fillText('Performance graph coming soon', 10, 100);
    }

    refresh() {
        // Reconnect WebSocket if needed
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.connectWebSocket();
        }
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.consoleView = new Console();
});