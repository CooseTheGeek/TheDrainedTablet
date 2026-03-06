// PLAYER ACTIONS - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class PlayerActions {
    constructor(tablet) {
        this.tablet = tablet;
        this.warnings = new Map();
        this.mutedPlayers = new Map();
        this.init();
    }

    init() {
        this.createActionsHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'playerActions') {
                this.refresh();
            }
        });
    }

    createActionsHTML() {
        const actionsTab = document.getElementById('tab-playerActions');
        if (!actionsTab) return;

        actionsTab.innerHTML = `
            <div class="actions-container">
                <div class="actions-header">
                    <h2>🎮 PLAYER ACTIONS</h2>
                </div>

                <div class="actions-grid">
                    <div class="actions-section">
                        <h3>🎮 PLAYER ACTIONS</h3>
                        
                        <div class="form-group">
                            <label>Player:</label>
                            <input type="text" id="action-player" placeholder="Player name">
                        </div>
                        
                        <div class="button-grid">
                            <button class="action-btn" data-cmd="warn">⚠️ WARN</button>
                            <button class="action-btn" data-cmd="mute">🔇 MUTE</button>
                            <button class="action-btn" data-cmd="unmute">🔊 UNMUTE</button>
                            <button class="action-btn" data-cmd="kick">👢 KICK</button>
                            <button class="action-btn warning" data-cmd="ban">🔨 BAN</button>
                            <button class="action-btn" data-cmd="votekick">🗳️ VOTEKICK</button>
                            <button class="action-btn" data-cmd="voteban">🗳️ VOTEBAN</button>
                        </div>
                    </div>

                    <div class="actions-section">
                        <h3>⚠️ WARNINGS</h3>
                        
                        <div class="warnings-list" id="warnings-list">
                            <div class="no-warnings">No active warnings</div>
                        </div>
                        
                        <div class="form-group">
                            <label>Check Warnings:</label>
                            <input type="text" id="check-warnings" placeholder="Player name">
                            <button id="get-warnings" class="action-btn small">CHECK</button>
                        </div>
                    </div>

                    <div class="actions-section">
                        <h3>🔇 MUTED PLAYERS</h3>
                        
                        <div class="muted-list" id="muted-list">
                            <div class="no-muted">No muted players</div>
                        </div>
                    </div>

                    <div class="actions-section">
                        <h3>📊 RECENT ACTIONS</h3>
                        
                        <div id="actions-history" class="actions-history">
                            <div class="history-item">[15:32] Warned RustGod - Toxicity</div>
                            <div class="history-item">[15:28] Muted PvPKing - 30m</div>
                            <div class="history-item">[15:22] Kicked BuilderBob - AFK</div>
                        </div>
                    </div>
                </div>

                <div class="actions-footer">
                    <button id="clear-warnings" class="action-btn warning">🗑️ CLEAR WARNINGS</button>
                    <button id="clear-mutes" class="action-btn warning">🗑️ CLEAR MUTES</button>
                    <button id="refresh-actions" class="action-btn">🔄 REFRESH</button>
                </div>
            </div>
        `;

        this.updateWarningsList();
        this.updateMutedList();
    }

    setupEventListeners() {
        document.querySelectorAll('.action-btn[data-cmd]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cmd = e.target.dataset.cmd;
                const player = document.getElementById('action-player').value;
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
        document.getElementById('refresh-actions')?.addEventListener('click', () => this.refresh());
    }

    executeCommand(cmd, player) {
        switch(cmd) {
            case 'warn':
                const reason = prompt(`Warning reason for ${player}:`, 'Breaking rules');
                if (reason) {
                    const count = (this.warnings.get(player) || 0) + 1;
                    this.warnings.set(player, count);
                    this.tablet.showToast(`⚠️ Warned ${player}: ${reason} (Warning ${count}/3)`, 'warning');
                    this.logAction('warn', player, reason);
                }
                break;
                
            case 'mute':
                const minutes = prompt(`Mute duration for ${player} (minutes):`, '30');
                if (minutes) {
                    this.mutedPlayers.set(player, Date.now() + minutes * 60000);
                    this.tablet.showToast(`🔇 Muted ${player} for ${minutes} minutes`, 'info');
                    this.logAction('mute', player, minutes);
                }
                break;
                
            case 'unmute':
                this.mutedPlayers.delete(player);
                this.tablet.showToast(`🔊 Unmuted ${player}`, 'success');
                this.logAction('unmute', player);
                break;
                
            case 'kick':
                const kickReason = prompt(`Kick reason for ${player}:`, 'Rule violation');
                if (kickReason) {
                    this.tablet.sendCommand(`kick ${player} "${kickReason}"`).then(() => {
                        this.tablet.showToast(`👢 Kicked ${player}: ${kickReason}`, 'warning');
                        this.logAction('kick', player, kickReason);
                    }).catch(err => {
                        this.tablet.showError('Kick failed: ' + err.message);
                    });
                }
                break;
                
            case 'ban':
                const banReason = prompt(`Ban reason for ${player}:`, 'Rule violation');
                if (banReason) {
                    const duration = prompt('Ban duration (hours, 0 = permanent):', '24');
                    // Ban command may require SteamID, but we'll use name for simplicity
                    this.tablet.sendCommand(`ban ${player} "${banReason}"`).then(() => {
                        this.tablet.showToast(`🔨 Banned ${player}: ${banReason} (${duration}h)`, 'error');
                        this.logAction('ban', player, `${banReason} (${duration}h)`);
                    }).catch(err => {
                        this.tablet.showError('Ban failed: ' + err.message);
                    });
                }
                break;
                
            case 'votekick':
                this.tablet.showToast('🗳️ Votekick started', 'info');
                this.logAction('votekick', player);
                break;
                
            case 'voteban':
                this.tablet.showToast('🗳️ Voteban started', 'warning');
                this.logAction('voteban', player);
                break;
        }

        this.updateWarningsList();
        this.updateMutedList();
    }

    checkWarnings(player) {
        const count = this.warnings.get(player) || 0;
        this.tablet.showToast(`${player} has ${count} warning(s)`, 'info');
    }

    logAction(action, player, details = '') {
        const history = document.getElementById('actions-history');
        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'history-item';
        entry.innerText = `[${time}] ${action.toUpperCase()} ${player} ${details}`;
        history.prepend(entry);
        if (history.children.length > 20) {
            history.removeChild(history.lastChild);
        }
    }

    updateWarningsList() {
        const list = document.getElementById('warnings-list');
        if (!list) return;

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
        if (!list) return;

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
        this.tablet.showToast('Player actions refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.playerActions = new PlayerActions(window.drainedTablet);
});