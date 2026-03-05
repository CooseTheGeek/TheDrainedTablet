// KAOSBOT INTEGRATION - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Stewart (CooseTheGeek). All Rights Reserved.

class KaosBot {
    constructor(tablet) {
        this.tablet = tablet;
        this.warnings = new Map();
        this.mutedPlayers = new Map();
        this.init();
    }

    init() {
        this.createKaosHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'kaosbot') {
                this.refresh();
            }
        });
    }

    createKaosHTML() {
        const kaosTab = document.getElementById('tab-kaosbot');
        if (!kaosTab) return;

        kaosTab.innerHTML = `
            <div class="kaos-container">
                <div class="kaos-header">
                    <h2>🤖 KAOSBOT COMMANDS</h2>
                </div>

                <div class="kaos-grid">
                    <div class="kaos-section">
                        <h3>🎮 PLAYER ACTIONS</h3>
                        
                        <div class="form-group">
                            <label>Player:</label>
                            <input type="text" id="kaos-player" placeholder="Player name">
                        </div>
                        
                        <div class="button-grid">
                            <button class="kaos-btn" data-cmd="warn">⚠️ WARN</button>
                            <button class="kaos-btn" data-cmd="mute">🔇 MUTE</button>
                            <button class="kaos-btn" data-cmd="unmute">🔊 UNMUTE</button>
                            <button class="kaos-btn" data-cmd="kick">👢 KICK</button>
                            <button class="kaos-btn warning" data-cmd="ban">🔨 BAN</button>
                            <button class="kaos-btn" data-cmd="votekick">🗳️ VOTEKICK</button>
                            <button class="kaos-btn" data-cmd="voteban">🗳️ VOTEBAN</button>
                        </div>
                    </div>

                    <div class="kaos-section">
                        <h3>⚠️ WARNINGS</h3>
                        
                        <div class="warnings-list" id="warnings-list">
                            <div class="no-warnings">No active warnings</div>
                        </div>
                        
                        <div class="form-group">
                            <label>Check Warnings:</label>
                            <input type="text" id="check-warnings" placeholder="Player name">
                            <button id="get-warnings" class="kaos-btn small">CHECK</button>
                        </div>
                    </div>

                    <div class="kaos-section">
                        <h3>🔇 MUTED PLAYERS</h3>
                        
                        <div class="muted-list" id="muted-list">
                            <div class="no-muted">No muted players</div>
                        </div>
                    </div>

                    <div class="kaos-section">
                        <h3>📊 RECENT ACTIONS</h3>
                        
                        <div id="kaos-history" class="kaos-history">
                            <div class="history-item">[15:32] Warned RustGod - Toxicity</div>
                            <div class="history-item">[15:28] Muted PvPKing - 30m</div>
                            <div class="history-item">[15:22] Kicked BuilderBob - AFK</div>
                        </div>
                    </div>
                </div>

                <div class="kaos-actions">
                    <button id="clear-warnings" class="kaos-btn warning">🗑️ CLEAR WARNINGS</button>
                    <button id="clear-mutes" class="kaos-btn warning">🗑️ CLEAR MUTES</button>
                    <button id="refresh-kaos" class="kaos-btn">🔄 REFRESH</button>
                </div>
            </div>
        `;

        this.updateWarningsList();
        this.updateMutedList();
    }

    setupEventListeners() {
        document.querySelectorAll('.kaos-btn[data-cmd]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cmd = e.target.dataset.cmd;
                const player = document.getElementById('kaos-player').value;
                if (!player && !['votekick', 'voteban'].includes(cmd)) {
                    this.tablet.showError('Enter player name');
                    return;
                }
                this.executeCommand(cmd, player);
            });
        });

        document.getElementById('get-warnings')?.addEventListener('click', () => {
            const player = document.getElementById('check-warnings').value;
            if (player) this.checkWarnings(player);
        });

        document.getElementById('clear-warnings')?.addEventListener('click', () => this.clearWarnings());
        document.getElementById('clear-mutes')?.addEventListener('click', () => this.clearMutes());
        document.getElementById('refresh-kaos')?.addEventListener('click', () => this.refresh());
    }

    executeCommand(cmd, player) {
        switch(cmd) {
            case 'warn':
                const reason = prompt(`Warning reason for ${player}:`, 'Breaking rules');
                if (reason) {
                    const count = (this.warnings.get(player) || 0) + 1;
                    this.warnings.set(player, count);
                    this.tablet.showToast(`⚠️ Warned ${player}: ${reason} (Warning ${count}/3)`, 'warning');
                }
                break;
                
            case 'mute':
                const minutes = prompt(`Mute duration for ${player} (minutes):`, '30');
                if (minutes) {
                    this.mutedPlayers.set(player, Date.now() + minutes * 60000);
                    this.tablet.showToast(`🔇 Muted ${player} for ${minutes} minutes`, 'info');
                }
                break;
                
            case 'unmute':
                this.mutedPlayers.delete(player);
                this.tablet.showToast(`🔊 Unmuted ${player}`, 'success');
                break;
                
            case 'kick':
                const kickReason = prompt(`Kick reason for ${player}:`, 'Rule violation');
                if (kickReason) {
                    this.tablet.showToast(`👢 Kicked ${player}: ${kickReason}`, 'warning');
                }
                break;
                
            case 'ban':
                const banReason = prompt(`Ban reason for ${player}:`, 'Rule violation');
                if (banReason) {
                    const duration = prompt('Ban duration (hours, 0 = permanent):', '24');
                    this.tablet.showToast(`🔨 Banned ${player}: ${banReason} (${duration}h)`, 'error');
                }
                break;
                
            case 'votekick':
                this.tablet.showToast('🗳️ Votekick started', 'info');
                break;
                
            case 'voteban':
                this.tablet.showToast('🗳️ Voteban started', 'warning');
                break;
        }

        this.updateWarningsList();
        this.updateMutedList();
    }

    checkWarnings(player) {
        const count = this.warnings.get(player) || 0;
        this.tablet.showToast(`${player} has ${count} warning(s)`, 'info');
    }

    updateWarningsList() {
        const list = document.getElementById('warnings-list');
        
        if (this.warnings.size === 0) {
            list.innerHTML = '<div class="no-warnings">No active warnings</div>';
            return;
        }

        let html = '';
        this.warnings.forEach((count, player) => {
            html += `
                <div class="warning-item">
                    <span>${player}</span>
                    <span class="warning-count">${count}/3</span>
                    <button class="small-btn clear-warning" data-player="${player}">✕</button>
                </div>
            `;
        });

        list.innerHTML = html;

        // Add clear handlers
        list.querySelectorAll('.clear-warning').forEach(btn => {
            btn.addEventListener('click', () => {
                const player = btn.dataset.player;
                this.warnings.delete(player);
                this.updateWarningsList();
                this.tablet.showToast(`Warnings cleared for ${player}`, 'info');
            });
        });
    }

    updateMutedList() {
        const list = document.getElementById('muted-list');
        const now = Date.now();

        // Clean expired mutes
        this.mutedPlayers.forEach((expires, player) => {
            if (expires < now) {
                this.mutedPlayers.delete(player);
            }
        });

        if (this.mutedPlayers.size === 0) {
            list.innerHTML = '<div class="no-muted">No muted players</div>';
            return;
        }

        let html = '';
        this.mutedPlayers.forEach((expires, player) => {
            const remaining = Math.ceil((expires - now) / 60000);
            html += `
                <div class="muted-item">
                    <span>${player}</span>
                    <span>${remaining}m remaining</span>
                    <button class="small-btn unmute-player" data-player="${player}">🔊</button>
                </div>
            `;
        });

        list.innerHTML = html;

        // Add unmute handlers
        list.querySelectorAll('.unmute-player').forEach(btn => {
            btn.addEventListener('click', () => {
                const player = btn.dataset.player;
                this.mutedPlayers.delete(player);
                this.updateMutedList();
                this.tablet.showToast(`Unmuted ${player}`, 'success');
            });
        });
    }

    clearWarnings() {
        this.tablet.showConfirm('Clear ALL warnings?', (confirmed) => {
            if (confirmed) {
                this.warnings.clear();
                this.updateWarningsList();
                this.tablet.showToast('All warnings cleared', 'info');
            }
        });
    }

    clearMutes() {
        this.tablet.showConfirm('Clear ALL mutes?', (confirmed) => {
            if (confirmed) {
                this.mutedPlayers.clear();
                this.updateMutedList();
                this.tablet.showToast('All mutes cleared', 'info');
            }
        });
    }

    refresh() {
        this.updateWarningsList();
        this.updateMutedList();
        this.tablet.showToast('KAOSBOT commands refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kaosBot = new KaosBot(window.drainedTablet);
});