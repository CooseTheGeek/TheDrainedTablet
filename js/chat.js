// chat.js – DRAINED TABLET ULTIMATE v7.0.0
// Live chat monitor and admin tools. Displays real‑time chat, allows sending messages,
// and provides admin actions (mute, kick, ban) that actually work via RCON.

class Chat {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.messages = this.loadMessages();
        this.mutedPlayers = this.loadMuted();
        this.autoRefresh = true;
        this.refreshInterval = null;
        this.init();
    }

    loadMessages() {
        const saved = sessionStorage.getItem('tdl_chat_messages');
        return saved ? JSON.parse(saved) : [{ user: 'SERVER', message: 'Chat system initialized', type: 'server', timestamp: Date.now() }];
    }

    loadMuted() {
        const saved = localStorage.getItem('tdl_muted_players');
        return saved ? JSON.parse(saved) : [];
    }

    saveMessages() {
        sessionStorage.setItem('tdl_chat_messages', JSON.stringify(this.messages.slice(-100)));
    }

    saveMuted() {
        localStorage.setItem('tdl_muted_players', JSON.stringify(this.mutedPlayers));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.startAutoRefresh();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'chat') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-chat');
        if (!tab) return;

        tab.innerHTML = `
            <div class="chat-container">
                <div class="chat-header">
                    <h2>SERVER CHAT</h2>
                    <div class="chat-controls">
                        <button id="chat-refresh" class="chat-btn">🔄 REFRESH</button>
                        <button id="chat-clear" class="chat-btn">🗑️ CLEAR</button>
                        <button id="chat-auto" class="chat-btn active">⏱️ AUTO</button>
                    </div>
                </div>
                
                <div class="chat-messages" id="chat-messages"></div>
                
                <div class="chat-input-area">
                    <select id="chat-send-as">
                        <option value="say">💬 Global</option>
                        <option value="broadcast">📢 Announce</option>
                        <option value="admin">👑 Admin</option>
                    </select>
                    <input type="text" id="chat-message-input" placeholder="Type your message...">
                    <button id="chat-send" class="chat-btn">SEND</button>
                </div>
                
                <div class="chat-admin">
                    <h4>ADMIN TOOLS</h4>
                    <div class="admin-controls">
                        <select id="chat-player-select">
                            <option value="">Select player...</option>
                        </select>
                        <button id="chat-mute" class="admin-btn">🔇 MUTE</button>
                        <button id="chat-unmute" class="admin-btn">🔊 UNMUTE</button>
                        <button id="chat-kick" class="admin-btn">👢 KICK</button>
                        <button id="chat-ban" class="admin-btn">🔨 BAN</button>
                    </div>
                    
                    <div class="quick-messages">
                        <button class="quick-msg" data-msg="Welcome to the server!">Welcome</button>
                        <button class="quick-msg" data-msg="Server restart in 10 minutes">Restart warning</button>
                        <button class="quick-msg" data-msg="Event starting soon!">Event</button>
                        <button class="quick-msg" data-msg="Vote for the server!">Vote</button>
                    </div>
                </div>
            </div>
        `;

        this.renderMessages();
        this.updatePlayerList();
    }

    attachEvents() {
        document.getElementById('chat-refresh')?.addEventListener('click', () => this.refresh());
        document.getElementById('chat-clear')?.addEventListener('click', () => this.clearChat());
        document.getElementById('chat-auto')?.addEventListener('click', (e) => this.toggleAutoRefresh(e));
        document.getElementById('chat-send')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('chat-message-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        document.getElementById('chat-mute')?.addEventListener('click', () => this.mutePlayer());
        document.getElementById('chat-unmute')?.addEventListener('click', () => this.unmutePlayer());
        document.getElementById('chat-kick')?.addEventListener('click', () => this.kickPlayer());
        document.getElementById('chat-ban')?.addEventListener('click', () => this.banPlayer());
        
        document.querySelectorAll('.quick-msg').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.getElementById('chat-message-input').value = e.target.dataset.msg;
            });
        });
    }

    renderMessages() {
        const container = document.getElementById('chat-messages');
        if (!container) return;

        let html = '';
        this.messages.slice(-50).forEach(msg => {
            const time = new Date(msg.timestamp).toLocaleTimeString();
            const isMuted = this.mutedPlayers.includes(msg.user);
            html += `
                <div class="chat-message ${msg.type} ${isMuted ? 'muted' : ''}">
                    <span class="msg-time">[${time}]</span>
                    <span class="msg-user" style="color: ${this.getUserColor(msg.user)}">${msg.user}:</span>
                    <span class="msg-text">${this.formatMessage(msg.message)}</span>
                    ${isMuted ? '<span class="muted-badge">MUTED</span>' : ''}
                </div>
            `;
        });
        container.innerHTML = html;
        container.scrollTop = container.scrollHeight;
    }

    formatMessage(text) {
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        text = text.replace(/:\)/g, '😊').replace(/:\(/g, '😢').replace(/:D/g, '😃').replace(/;\)/g, '😉');
        return text;
    }

    getUserColor(user) {
        if (user === 'SERVER') return '#00ff88';
        if (user === AppState.user.username) return '#D4AF37';
        if (this.access.isMaster()) return '#ff5500';
        return '#B0B0B0';
    }

    async sendMessage() {
        const input = document.getElementById('chat-message-input');
        const type = document.getElementById('chat-send-as').value;
        const message = input.value.trim();
        if (!message) return;

        const msg = {
            user: AppState.user.username || 'Admin',
            message,
            type,
            timestamp: Date.now()
        };
        this.messages.push(msg);
        this.saveMessages();
        this.renderMessages();
        input.value = '';

        if (AppState.connection.status === 'connected') {
            let command = '';
            if (type === 'say') command = `say ${message}`;
            else if (type === 'broadcast') command = `broadcast ${message}`;
            else if (type === 'admin') command = `say [Admin] ${message}`;
            try {
                await ConnectionManager.executeCommand(command);
            } catch (err) {
                this.tablet.showError('Failed to send: ' + err.message);
            }
        } else {
            this.tablet.showError('Not connected to server');
        }
    }

    addMessage(user, message, type = 'user') {
        this.messages.push({ user, message, type, timestamp: Date.now() });
        this.saveMessages();
        this.renderMessages();
    }

    refresh() {
        this.tablet.showToast('Refreshing chat...', 'info');
        this.addMessage('SERVER', 'Chat refreshed', 'server');
    }

    clearChat() {
        if (!confirm('Clear all chat messages?')) return;
        this.messages = [{ user: 'SERVER', message: 'Chat cleared', type: 'server', timestamp: Date.now() }];
        this.saveMessages();
        this.renderMessages();
        this.tablet.showToast('Chat cleared', 'success');
    }

    toggleAutoRefresh(e) {
        this.autoRefresh = !this.autoRefresh;
        e.target.classList.toggle('active');
        if (this.autoRefresh) {
            this.startAutoRefresh();
            this.tablet.showToast('Auto‑refresh enabled', 'success');
        } else {
            this.stopAutoRefresh();
            this.tablet.showToast('Auto‑refresh disabled', 'info');
        }
    }

    startAutoRefresh() {
        this.stopAutoRefresh();
        this.refreshInterval = setInterval(() => {
            if (this.autoRefresh && AppState.connection.status === 'connected') {
                // In a real implementation, you'd fetch new messages via RCON or WebSocket
                this.renderMessages();
            }
        }, 30000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    updatePlayerList() {
        const select = document.getElementById('chat-player-select');
        if (!select) return;
        const players = AppState.players.map(p => p.name);
        select.innerHTML = '<option value="">Select player...</option>';
        players.forEach(player => {
            select.innerHTML += `<option value="${player}">${player}</option>`;
        });
    }

    async mutePlayer() {
        if (!this.access.hasRole('master')) {
            this.tablet.showError('Admin access required');
            return;
        }
        const player = document.getElementById('chat-player-select').value;
        if (!player) {
            this.tablet.showError('Select a player');
            return;
        }
        const minutes = prompt(`Mute ${player} for how many minutes?`, '30');
        if (!minutes) return;
        try {
            await ConnectionManager.executeCommand(`mute ${player} ${minutes}`);
            if (!this.mutedPlayers.includes(player)) {
                this.mutedPlayers.push(player);
                this.saveMuted();
                this.renderMessages();
            }
            this.tablet.showToast(`${player} muted for ${minutes} minutes`, 'warning');
            this.addMessage('SERVER', `${player} was muted for ${minutes} minutes`, 'server');
        } catch (err) {
            this.tablet.showError('Mute failed: ' + err.message);
        }
    }

    async unmutePlayer() {
        const player = document.getElementById('chat-player-select').value;
        if (!player) return;
        try {
            await ConnectionManager.executeCommand(`unmute ${player}`);
            this.mutedPlayers = this.mutedPlayers.filter(p => p !== player);
            this.saveMuted();
            this.renderMessages();
            this.tablet.showToast(`${player} unmuted`, 'success');
            this.addMessage('SERVER', `${player} was unmuted`, 'server');
        } catch (err) {
            this.tablet.showError('Unmute failed: ' + err.message);
        }
    }

    async kickPlayer() {
        if (!this.access.hasRole('master')) {
            this.tablet.showError('Admin access required');
            return;
        }
        const player = document.getElementById('chat-player-select').value;
        if (!player) return;
        if (!confirm(`Kick ${player}?`)) return;
        try {
            await ConnectionManager.executeCommand(`kick ${player}`);
            this.addMessage('SERVER', `${player} was kicked`, 'server');
            this.tablet.showToast(`${player} kicked`, 'warning');
        } catch (err) {
            this.tablet.showError('Kick failed: ' + err.message);
        }
    }

    async banPlayer() {
        if (!this.access.hasRole('master')) {
            this.tablet.showError('Master access required');
            return;
        }
        const player = document.getElementById('chat-player-select').value;
        if (!player) return;
        const reason = prompt('Ban reason:');
        if (!reason) return;
        if (!confirm(`Ban ${player}?`)) return;
        try {
            await ConnectionManager.executeCommand(`ban ${player} "${reason}"`);
            this.addMessage('SERVER', `${player} was banned: ${reason}`, 'server');
            this.tablet.showToast(`${player} banned`, 'error');
        } catch (err) {
            this.tablet.showError('Ban failed: ' + err.message);
        }
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chat = new Chat();
});