// CHAT SYSTEM - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class ChatSystem {
    constructor(tablet) {
        this.tablet = tablet;
        this.messages = this.loadMessages();
        this.mutedPlayers = this.loadMuted();
        this.autoRefresh = true;
        this.refreshInterval = null;
        this.init();
    }

    loadMessages() {
        const saved = sessionStorage.getItem('drained_chat_messages');
        return saved ? JSON.parse(saved) : [
            { user: 'SERVER', message: 'Chat system initialized', type: 'server', timestamp: Date.now() }
        ];
    }

    loadMuted() {
        const saved = localStorage.getItem('drained_muted_players');
        return saved ? JSON.parse(saved) : [];
    }

    saveMessages() {
        sessionStorage.setItem('drained_chat_messages', JSON.stringify(this.messages.slice(-100)));
    }

    saveMuted() {
        localStorage.setItem('drained_muted_players', JSON.stringify(this.mutedPlayers));
    }

    init() {
        this.createChatHTML();
        this.setupEventListeners();
        this.startAutoRefresh();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'chat') {
                this.refresh();
            }
        });
    }

    createChatHTML() {
        const chatTab = document.getElementById('tab-chat');
        if (!chatTab) return;

        chatTab.innerHTML = `
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

    setupEventListeners() {
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
        // Replace URLs with links
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Replace common emotes
        text = text.replace(/:\)/g, '😊');
        text = text.replace(/:\(/g, '😢');
        text = text.replace(/:D/g, '😃');
        text = text.replace(/;\)/g, '😉');
        
        return text;
    }

    getUserColor(user) {
        if (user === 'SERVER') return '#00ff88';
        if (user === this.tablet.currentUser) return '#FFB100';
        if (this.tablet.users[user]?.level === 'master') return '#ff5500';
        if (this.tablet.users[user]?.level === 'owner') return '#ffaa00';
        return '#aa8c4c';
    }

    async sendMessage() {
        const input = document.getElementById('chat-message-input');
        const type = document.getElementById('chat-send-as').value;
        const message = input.value.trim();

        if (!message) return;

        const msg = {
            user: this.tablet.currentUser || 'Admin',
            message: message,
            type: type,
            timestamp: Date.now()
        };

        this.messages.push(msg);
        this.saveMessages();
        this.renderMessages();
        input.value = '';

        // Send to server via RCON
        if (this.tablet.connected) {
            let command = '';
            if (type === 'say') command = `say ${message}`;
            else if (type === 'broadcast') command = `broadcast ${message}`;
            else if (type === 'admin') command = `say [Admin] ${message}`;
            
            this.tablet.sendCommand(command).then(() => {
                this.tablet.showToast('Message sent', 'success');
            }).catch(err => {
                this.tablet.showError('Failed to send: ' + err.message);
            });
        }
    }

    addMessage(user, message, type = 'user') {
        this.messages.push({
            user: user,
            message: message,
            type: type,
            timestamp: Date.now()
        });
        
        this.saveMessages();
        this.renderMessages();
    }

    refresh() {
        this.tablet.showToast('Refreshing chat...', 'info');
        this.addMessage('SERVER', 'Chat refreshed', 'server');
    }

    clearChat() {
        this.tablet.showConfirm('Clear all chat messages?', (confirmed) => {
            if (confirmed) {
                this.messages = [{
                    user: 'SERVER',
                    message: 'Chat cleared',
                    type: 'server',
                    timestamp: Date.now()
                }];
                this.saveMessages();
                this.renderMessages();
                this.tablet.showToast('Chat cleared', 'success');
            }
        });
    }

    toggleAutoRefresh(e) {
        this.autoRefresh = !this.autoRefresh;
        e.target.classList.toggle('active');
        
        if (this.autoRefresh) {
            this.startAutoRefresh();
            this.tablet.showToast('Auto-refresh enabled', 'success');
        } else {
            this.stopAutoRefresh();
            this.tablet.showToast('Auto-refresh disabled', 'info');
        }
    }

    startAutoRefresh() {
        this.stopAutoRefresh();
        this.refreshInterval = setInterval(() => {
            if (this.autoRefresh && this.tablet.connected) {
                // In a real implementation, this would fetch new messages
                // For now, we'll just refresh the display
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

        // Get online players from tablet
        const players = this.tablet.realPlayers.map(p => p.name);
        
        select.innerHTML = '<option value="">Select player...</option>';
        players.forEach(player => {
            select.innerHTML += `<option value="${player}">${player}</option>`;
        });
    }

    mutePlayer() {
        if (!this.tablet.isMaster() && !this.tablet.isOwner()) {
            this.tablet.showError('Admin access required');
            return;
        }

        const player = document.getElementById('chat-player-select').value;
        if (!player) {
            this.tablet.showError('Select a player');
            return;
        }

        const minutes = prompt(`Mute ${player} for how many minutes?`, '30');
        if (minutes) {
            this.tablet.sendCommand(`mute ${player} ${minutes}`).then(() => {
                if (!this.mutedPlayers.includes(player)) {
                    this.mutedPlayers.push(player);
                    this.saveMuted();
                    this.renderMessages();
                    this.tablet.showToast(`${player} muted for ${minutes} minutes`, 'warning');
                    this.addMessage('SERVER', `${player} was muted for ${minutes} minutes`, 'server');
                }
            }).catch(err => {
                this.tablet.showError('Mute failed: ' + err.message);
            });
        }
    }

    unmutePlayer() {
        const player = document.getElementById('chat-player-select').value;
        if (!player) return;

        this.tablet.sendCommand(`unmute ${player}`).then(() => {
            this.mutedPlayers = this.mutedPlayers.filter(p => p !== player);
            this.saveMuted();
            this.renderMessages();
            this.tablet.showToast(`${player} unmuted`, 'success');
            this.addMessage('SERVER', `${player} was unmuted`, 'server');
        }).catch(err => {
            this.tablet.showError('Unmute failed: ' + err.message);
        });
    }

    kickPlayer() {
        if (!this.tablet.isMaster() && !this.tablet.isOwner()) {
            this.tablet.showError('Admin access required');
            return;
        }

        const player = document.getElementById('chat-player-select').value;
        if (!player) return;

        this.tablet.showConfirm(`Kick ${player}?`, (confirmed) => {
            if (confirmed) {
                this.tablet.sendCommand(`kick ${player}`).then(() => {
                    this.addMessage('SERVER', `${player} was kicked`, 'server');
                    this.tablet.showToast(`${player} kicked`, 'warning');
                }).catch(err => {
                    this.tablet.showError('Kick failed: ' + err.message);
                });
            }
        });
    }

    banPlayer() {
        if (!this.tablet.isMaster()) {
            this.tablet.showError('Master access required');
            return;
        }

        const player = document.getElementById('chat-player-select').value;
        if (!player) return;

        const reason = prompt('Ban reason:');
        if (!reason) return;

        this.tablet.showConfirm(`Ban ${player}?`, (confirmed) => {
            if (confirmed) {
                this.tablet.sendCommand(`ban ${player} "${reason}"`).then(() => {
                    this.addMessage('SERVER', `${player} was banned: ${reason}`, 'server');
                    this.tablet.showToast(`${player} banned`, 'error');
                }).catch(err => {
                    this.tablet.showError('Ban failed: ' + err.message);
                });
            }
        });
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chatSystem = new ChatSystem(window.drainedTablet);
});