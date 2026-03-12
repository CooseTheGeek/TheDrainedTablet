// teleport.js – DRAINED TABLET ULTIMATE v7.0.0
// Complete teleportation management for admins.
// Includes all 17 no‑coordinate commands, coordinate inputs, and history.

class Teleport {
    constructor() {
        this.tablet = window.drainedTablet;
        this.cmd = window.serverCommands;
        this.access = window.accessControl;
        this.history = this.loadHistory();
        this.init();
    }

    loadHistory() {
        const saved = localStorage.getItem('tdl_teleport_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveHistory() {
        localStorage.setItem('tdl_teleport_history', JSON.stringify(this.history.slice(0, 20)));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'teleport') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-teleport');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="teleport-container">
                <div class="teleport-header">
                    <h2>📍 TELEPORT MANAGER</h2>
                    <button id="teleport-refresh" class="teleport-btn">🔄 REFRESH</button>
                </div>

                <div class="teleport-grid">
                    <div class="teleport-section">
                        <h3>🎯 TO PLAYER</h3>
                        <button class="teleport-cmd" data-cmd="teleport">📍 Go to Player</button>
                        <button class="teleport-cmd" data-cmd="teleport2me">🫴 Bring Player to Me</button>
                        <button class="teleport-cmd" data-cmd="teleport.toplayer">🔄 Teleport Player to Player</button>
                    </div>

                    <div class="teleport-section">
                        <h3>📌 TO COORDINATES</h3>
                        <div class="coord-inputs">
                            <input type="number" id="teleport-x" placeholder="X" value="0">
                            <input type="number" id="teleport-y" placeholder="Y" value="0">
                            <input type="number" id="teleport-z" placeholder="Z" value="0">
                        </div>
                        <button class="teleport-cmd" data-cmd="teleportpos">📍 Teleport to Coords</button>
                        <button class="teleport-cmd" data-cmd="teleport.topos">🎯 Send Player to Coords</button>
                    </div>

                    <div class="teleport-section">
                        <h3>🗺️ MAP & MARKER</h3>
                        <button class="teleport-cmd" data-cmd="teleport2marker">📍 To Map Marker</button>
                        <button class="teleport-cmd" data-cmd="teleport2grid">📍 To Grid (e.g., A1)</button>
                        <div class="inline-input">
                            <input type="text" id="teleport-grid" placeholder="Grid (e.g., A1)">
                            <button class="teleport-cmd" data-cmd="teleport2grid-custom">GO</button>
                        </div>
                    </div>

                    <div class="teleport-section">
                        <h3>⚰️ DEATH & MISSION</h3>
                        <button class="teleport-cmd" data-cmd="teleport2death">💀 To Last Death</button>
                        <button class="teleport-cmd" data-cmd="teleport2mission">📋 To Current Mission</button>
                    </div>

                    <div class="teleport-section">
                        <h3>🏠 HOME & ITEMS</h3>
                        <button class="teleport-cmd" data-cmd="home">🏠 Go Home</button>
                        <button class="teleport-cmd" data-cmd="teleport2owneditem">🔑 To Player's Owned Item</button>
                        <button class="teleport-cmd" data-cmd="teleport2autheditem">🔓 To Authed Item</button>
                    </div>

                    <div class="teleport-section">
                        <h3>🦌 ENTITIES</h3>
                        <button class="teleport-cmd" data-cmd="teleportany">🐻 To Nearest Entity</button>
                        <select id="teleport-entity">
                            <option value="bear">Bear</option>
                            <option value="wolf">Wolf</option>
                            <option value="scientist">Scientist</option>
                            <option value="heli">Helicopter</option>
                            <option value="crate">Crate</option>
                        </select>
                    </div>

                    <div class="teleport-section">
                        <h3>👥 MASS TELEPORT</h3>
                        <button class="teleport-cmd" data-cmd="teleportteam2me">👪 Bring Team</button>
                        <button class="teleport-cmd" data-cmd="teleporteveryone2me">🌍 Bring Everyone</button>
                        <button class="teleport-cmd" data-cmd="teleportnonsleepers2me">👤 Bring Active Players</button>
                    </div>
                </div>

                <div class="teleport-history">
                    <h3>📜 RECENT TELEPORTS</h3>
                    <div id="teleport-history-list" class="history-list"></div>
                </div>
            </div>
        `;
    }

    attachEvents() {
        document.getElementById('teleport-refresh')?.addEventListener('click', () => this.refresh());

        document.querySelectorAll('.teleport-cmd').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const cmd = e.target.dataset.cmd;
                await this.executeCommand(cmd);
            });
        });

        // Special handlers for commands that need input
        document.querySelector('[data-cmd="teleport.toplayer"]')?.addEventListener('click', async () => {
            const player1 = prompt('Source player name:');
            const player2 = prompt('Destination player name:');
            if (player1 && player2) {
                await this.executeCommand(`teleport.toplayer "${player1}" "${player2}"`);
            }
        });

        document.querySelector('[data-cmd="teleport.topos"]')?.addEventListener('click', async () => {
            const player = prompt('Player name:');
            const x = document.getElementById('teleport-x').value;
            const y = document.getElementById('teleport-y').value;
            const z = document.getElementById('teleport-z').value;
            if (player && x && y && z) {
                await this.executeCommand(`teleport.topos "${player}" ${x} ${y} ${z}`);
            }
        });

        document.querySelector('[data-cmd="teleport2grid-custom"]')?.addEventListener('click', async () => {
            const grid = document.getElementById('teleport-grid').value;
            if (grid) {
                await this.executeCommand(`teleport2grid ${grid}`);
            }
        });

        document.querySelector('[data-cmd="teleport2owneditem"]')?.addEventListener('click', async () => {
            const player = prompt('Player name:');
            const item = prompt('Item shortname:');
            if (player && item) {
                await this.executeCommand(`teleport2owneditem "${player}" ${item}`);
            }
        });

        document.querySelector('[data-cmd="teleportany"]')?.addEventListener('click', async () => {
            const entity = document.getElementById('teleport-entity').value;
            await this.executeCommand(`teleportany ${entity}`);
        });

        // Teleport to player – needs input
        document.querySelector('[data-cmd="teleport"]')?.addEventListener('click', async () => {
            const player = prompt('Player name:');
            if (player) await this.executeCommand(`teleport "${player}"`);
        });

        document.querySelector('[data-cmd="teleport2me"]')?.addEventListener('click', async () => {
            const player = prompt('Player name to bring:');
            if (player) await this.executeCommand(`teleport2me "${player}"`);
        });

        // Teleport to coordinates
        document.querySelector('[data-cmd="teleportpos"]')?.addEventListener('click', async () => {
            const x = document.getElementById('teleport-x').value;
            const y = document.getElementById('teleport-y').value;
            const z = document.getElementById('teleport-z').value;
            await this.executeCommand(`teleportpos ${x} ${y} ${z}`);
        });

        // Map marker – no input needed
        // Death, mission, home, etc. – no input
    }

    async executeCommand(fullCommand) {
        try {
            const result = await ConnectionManager.executeCommand(fullCommand);
            // Add to history
            this.history.unshift({
                command: fullCommand,
                time: Date.now(),
                result: result?.substring(0, 50) + (result?.length > 50 ? '...' : '')
            });
            this.saveHistory();
            this.renderHistory();
            this.tablet.showToast('Teleport executed', 'success');
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    renderHistory() {
        const list = document.getElementById('teleport-history-list');
        if (!list) return;
        if (this.history.length === 0) {
            list.innerHTML = '<div class="no-history">No recent teleports</div>';
            return;
        }
        let html = '';
        this.history.slice(0, 10).forEach(entry => {
            const time = new Date(entry.time).toLocaleTimeString();
            html += `<div class="history-item"><span class="time">[${time}]</span> ${entry.command}</div>`;
        });
        list.innerHTML = html;
    }

    refresh() {
        this.renderHistory();
        this.tablet.showToast('Teleport page refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.teleport = new Teleport();
});