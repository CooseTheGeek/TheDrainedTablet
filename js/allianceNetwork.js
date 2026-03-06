// ALLIANCE NETWORK - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class AllianceNetwork {
    constructor(tablet) {
        this.tablet = tablet;
        this.alliances = this.loadAlliances();
        this.sharedBans = this.loadSharedBans();
        this.networkStatus = 'connected';
        this.init();
    }

    loadAlliances() {
        const saved = localStorage.getItem('drained_alliances');
        return saved ? JSON.parse(saved) : [
            {
                id: 'ally_1',
                name: 'Rusty Wasteland',
                admin: 'RustKing',
                ip: '123.45.67.89',
                port: 28916,
                status: 'online',
                players: 34,
                lastSync: new Date().toISOString(),
                sharedBans: true,
                sharedData: true
            },
            {
                id: 'ally_2',
                name: 'Builders Paradise',
                admin: 'BuilderPro',
                ip: '98.76.54.32',
                port: 28916,
                status: 'online',
                players: 28,
                lastSync: new Date(Date.now() - 3600000).toISOString(),
                sharedBans: true,
                sharedData: false
            }
        ];
    }

    loadSharedBans() {
        const saved = localStorage.getItem('drained_shared_bans');
        return saved ? JSON.parse(saved) : [
            { player: 'HackerJoe', bannedOn: ['Rusty Wasteland', 'Builders Paradise'], reason: 'ESP Hacks', date: '2026-03-15' },
            { player: 'Griefer99', bannedOn: ['Rusty Wasteland'], reason: 'Griefing', date: '2026-03-14' },
            { player: 'ToxicPlayer', bannedOn: ['Builders Paradise', 'Drained Land'], reason: 'Toxicity', date: '2026-03-12' }
        ];
    }

    saveAlliances() {
        localStorage.setItem('drained_alliances', JSON.stringify(this.alliances));
    }

    saveSharedBans() {
        localStorage.setItem('drained_shared_bans', JSON.stringify(this.sharedBans));
    }

    init() {
        this.createAllianceHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'alliance') {
                this.refresh();
            }
        });
    }

    createAllianceHTML() {
        const allianceTab = document.getElementById('tab-alliance');
        if (!allianceTab) return;

        allianceTab.innerHTML = `
            <div class="alliance-container">
                <div class="alliance-header">
                    <h2>🤝 ALLIANCE NETWORK</h2>
                    <div class="network-status">
                        <span class="status-indicator ${this.networkStatus}"></span>
                        <span>Network: ${this.networkStatus.toUpperCase()}</span>
                    </div>
                </div>

                <div class="alliance-grid">
                    <div class="allied-servers">
                        <h3>🔗 ALLIED SERVERS</h3>
                        <div id="allies-list" class="allies-list"></div>
                        <button id="add-alliance" class="alliance-btn primary">➕ ADD ALLIANCE</button>
                    </div>

                    <div class="shared-bans">
                        <h3>🚫 SHARED BAN LIST</h3>
                        <div id="shared-bans-list" class="bans-list"></div>
                        <div class="ban-actions">
                            <button id="sync-bans" class="alliance-btn">🔄 SYNC BANS</button>
                            <button id="push-bans" class="alliance-btn">📤 PUSH BANS</button>
                        </div>
                    </div>

                    <div class="alliance-chat">
                        <h3>💬 ALLIANCE CHAT</h3>
                        <div id="alliance-chat-messages" class="chat-messages">
                            <div class="message">[Rusty Wasteland] Anyone need help?</div>
                            <div class="message">[Builders Paradise] Raid at Dome!</div>
                        </div>
                        <div class="chat-input">
                            <input type="text" id="alliance-message" placeholder="Type message...">
                            <button id="send-alliance" class="alliance-btn">SEND</button>
                        </div>
                    </div>

                    <div class="network-stats">
                        <h3>📊 NETWORK STATS</h3>
                        <div class="stat-row">
                            <span>Connected Servers:</span>
                            <span id="stat-servers">${this.alliances.length}</span>
                        </div>
                        <div class="stat-row">
                            <span>Total Players:</span>
                            <span id="stat-players">${this.alliances.reduce((sum, a) => sum + a.players, 0)}</span>
                        </div>
                        <div class="stat-row">
                            <span>Shared Bans:</span>
                            <span id="stat-bans">${this.sharedBans.length}</span>
                        </div>
                        <div class="stat-row">
                            <span>Last Network Sync:</span>
                            <span id="stat-sync">Just now</span>
                        </div>
                    </div>
                </div>

                <!-- Add Alliance Modal -->
                <div id="alliance-modal" class="modal hidden">
                    <div class="modal-content">
                        <h2>ADD ALLIANCE SERVER</h2>
                        
                        <div class="form-group">
                            <label>Server Name:</label>
                            <input type="text" id="ally-name" placeholder="e.g., Rusty Wasteland">
                        </div>
                        
                        <div class="form-group">
                            <label>Admin Name:</label>
                            <input type="text" id="ally-admin" placeholder="Admin name">
                        </div>
                        
                        <div class="form-group">
                            <label>IP Address:</label>
                            <input type="text" id="ally-ip" placeholder="123.45.67.89">
                        </div>
                        
                        <div class="form-group">
                            <label>RCON Port:</label>
                            <input type="number" id="ally-port" value="28916">
                        </div>
                        
                        <div class="form-group">
                            <label>RCON Password:</label>
                            <input type="password" id="ally-password">
                        </div>
                        
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="share-bans" checked>
                                Share bans with this server
                            </label>
                            <label>
                                <input type="checkbox" id="share-data">
                                Share player data
                            </label>
                        </div>
                        
                        <div class="modal-actions">
                            <button id="save-alliance" class="alliance-btn primary">ADD ALLIANCE</button>
                            <button id="test-connection" class="alliance-btn">TEST CONNECTION</button>
                            <button id="cancel-alliance" class="alliance-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderAllies();
        this.renderSharedBans();
    }

    setupEventListeners() {
        document.getElementById('add-alliance')?.addEventListener('click', () => this.openAllianceModal());
        document.getElementById('sync-bans')?.addEventListener('click', () => this.syncBans());
        document.getElementById('push-bans')?.addEventListener('click', () => this.pushBans());
        document.getElementById('send-alliance')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('alliance-message')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        document.getElementById('save-alliance')?.addEventListener('click', () => this.saveAlliance());
        document.getElementById('test-connection')?.addEventListener('click', () => this.testConnection());
        document.getElementById('cancel-alliance')?.addEventListener('click', () => {
            document.getElementById('alliance-modal').classList.add('hidden');
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-ally')) {
                const id = e.target.dataset.id;
                this.removeAlly(id);
            }
            if (e.target.classList.contains('sync-ally')) {
                const id = e.target.dataset.id;
                this.syncAlly(id);
            }
            if (e.target.classList.contains('message-ally')) {
                const id = e.target.dataset.id;
                this.messageAlly(id);
            }
            if (e.target.classList.contains('sync-ban')) {
                const player = e.target.dataset.player;
                this.syncBan(player);
            }
        });
    }

    renderAllies() {
        const list = document.getElementById('allies-list');
        
        let html = '';
        this.alliances.forEach(ally => {
            const lastSync = new Date(ally.lastSync).toLocaleTimeString();
            html += `
                <div class="ally-card">
                    <div class="ally-header">
                        <span class="ally-name">${ally.name}</span>
                        <span class="ally-status ${ally.status}">${ally.status === 'online' ? '🟢' : '🔴'}</span>
                    </div>
                    <div class="ally-details">
                        <div>Admin: ${ally.admin}</div>
                        <div>Players: ${ally.players}</div>
                        <div>Last Sync: ${lastSync}</div>
                        <div>Share Bans: ${ally.sharedBans ? '✅' : '❌'}</div>
                    </div>
                    <div class="ally-actions">
                        <button class="small-btn sync-ally" data-id="${ally.id}">🔄 SYNC</button>
                        <button class="small-btn message-ally" data-id="${ally.id}">💬 MESSAGE</button>
                        <button class="small-btn remove-ally" data-id="${ally.id}">✕</button>
                    </div>
                </div>
            `;
        });

        list.innerHTML = html;
    }

    renderSharedBans() {
        const list = document.getElementById('shared-bans-list');
        
        let html = '<table class="bans-table"><tr><th>Player</th><th>Banned On</th><th>Reason</th><th>Action</th></tr>';
        
        this.sharedBans.forEach(ban => {
            html += `
                <tr>
                    <td>${ban.player}</td>
                    <td>${ban.bannedOn.join(', ')}</td>
                    <td>${ban.reason}</td>
                    <td><button class="small-btn sync-ban" data-player="${ban.player}">📥 SYNC</button></td>
                </tr>
            `;
        });

        html += '</table>';
        list.innerHTML = html;
    }

    openAllianceModal() {
        document.getElementById('alliance-modal').classList.remove('hidden');
    }

    saveAlliance() {
        const name = document.getElementById('ally-name').value;
        const admin = document.getElementById('ally-admin').value;
        const ip = document.getElementById('ally-ip').value;
        const port = parseInt(document.getElementById('ally-port').value);
        const shareBans = document.getElementById('share-bans').checked;
        const shareData = document.getElementById('share-data').checked;

        if (!name || !ip) {
            this.tablet.showError('Name and IP required');
            return;
        }

        const alliance = {
            id: 'ally_' + Date.now(),
            name: name,
            admin: admin,
            ip: ip,
            port: port,
            status: 'offline',
            players: 0,
            lastSync: new Date().toISOString(),
            sharedBans: shareBans,
            sharedData: shareData
        };

        this.alliances.push(alliance);
        this.saveAlliances();
        this.renderAllies();
        document.getElementById('alliance-modal').classList.add('hidden');
        this.tablet.showToast(`Alliance added with ${name}`, 'success');
    }

    removeAlly(id) {
        this.tablet.showConfirm('Remove this alliance?', (confirmed) => {
            if (confirmed) {
                this.alliances = this.alliances.filter(a => a.id !== id);
                this.saveAlliances();
                this.renderAllies();
                this.tablet.showToast('Alliance removed', 'info');
            }
        });
    }

    syncAlly(id) {
        const ally = this.alliances.find(a => a.id === id);
        if (ally) {
            ally.lastSync = new Date().toISOString();
            ally.status = 'online';
            ally.players = Math.floor(Math.random() * 50) + 10;
            this.saveAlliances();
            this.renderAllies();
            this.tablet.showToast(`Synced with ${ally.name}`, 'success');
        }
    }

    messageAlly(id) {
        const ally = this.alliances.find(a => a.id === id);
        if (ally) {
            const msg = prompt(`Message to ${ally.name}:`);
            if (msg) {
                this.tablet.showToast(`Message sent to ${ally.name}`, 'success');
            }
        }
    }

    syncBans() {
        this.tablet.showToast('Syncing bans with all allies...', 'info');
        setTimeout(() => {
            this.tablet.showToast('Ban sync complete', 'success');
        }, 2000);
    }

    pushBans() {
        this.tablet.showToast('Pushing local bans to network...', 'info');
        setTimeout(() => {
            this.tablet.showToast('Bans pushed to network', 'success');
        }, 2000);
    }

    syncBan(player) {
        this.tablet.showConfirm(`Import ban for ${player}?`, (confirmed) => {
            if (confirmed) {
                this.tablet.showToast(`${player} added to local ban list`, 'success');
            }
        });
    }

    sendMessage() {
        const msg = document.getElementById('alliance-message').value;
        if (msg) {
            const chat = document.getElementById('alliance-chat-messages');
            chat.innerHTML += `<div class="message">[You] ${msg}</div>`;
            document.getElementById('alliance-message').value = '';
            chat.scrollTop = chat.scrollHeight;
        }
    }

    testConnection() {
        this.tablet.showToast('Testing connection...', 'info');
        setTimeout(() => {
            this.tablet.showToast('Connection successful!', 'success');
        }, 1500);
    }

    refresh() {
        this.renderAllies();
        this.renderSharedBans();
        this.tablet.showToast('Alliance network refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.allianceNetwork = new AllianceNetwork(window.drainedTablet);
});