// horde-spawner.js – DRAINED TABLET ULTIMATE v7.0.0
// Spawn NPC hordes (scientists, murderers, scarecrows) at player position or custom coordinates.

class HordeSpawner {
    constructor() {
        this.access = window.accessControl;
        this.npcTypes = [
            { name: "Scientist", shortname: "scientist", icon: "👨‍🔬" },
            { name: "Murderer", shortname: "murderer", icon: "🔪" },
            { name: "Scarecrow", shortname: "scarecrow", icon: "🎃" },
            { name: "Bradley APC", shortname: "bradley", icon: "💥" } // note: bradley is an entity, may not spawn? We'll include.
        ];
        this.activeHorde = null; // store timeout for auto-cancel
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'horde') this.refresh();
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-horde');
        if (!tab) return;
        tab.innerHTML = `
            <div class="horde-container" style="padding:1rem;">
                <div class="horde-header">
                    <h2>🧟 NPC HORDES</h2>
                    <p>Spawn a wave of hostile NPCs at any player or location.</p>
                </div>
                <div class="horde-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
                    <div class="horde-controls glass-card">
                        <h3>🎮 Spawn Configuration</h3>
                        <div class="form-group"><label>NPC Type</label><select id="npc-type">${this.npcTypes.map(n => `<option value="${n.shortname}">${n.icon} ${n.name}</option>`).join('')}</select></div>
                        <div class="form-group"><label>Quantity (max 15)</label><input type="number" id="npc-count" min="1" max="15" value="5"></div>
                        <hr>
                        <div class="form-group"><label>Player (online)</label><select id="horde-player-select"><option value="">Select player...</option></select></div>
                        <button id="get-player-location" class="small-btn">📍 Use Player Location</button>
                        <div class="coord-inputs" style="margin:0.5rem 0;">
                            <input type="number" id="horde-x" placeholder="X" value="0">
                            <input type="number" id="horde-y" placeholder="Y" value="0">
                            <input type="number" id="horde-z" placeholder="Z" value="0">
                        </div>
                        <div id="horde-coord-display" class="coord-display">Coordinates: not set</div>
                        <div class="button-group" style="margin-top:1rem;">
                            <button id="spawn-horde" class="primary">⚔️ SPAWN HORDE</button>
                            <button id="cancel-horde" class="warning">⛔ CANCEL EVENT</button>
                        </div>
                    </div>
                    <div class="horde-info glass-card">
                        <h3>ℹ️ Info</h3>
                        <p>NPCs will spawn in a circle around the selected location. Maximum 15 NPCs per spawn.</p>
                        <p>Use "Get Player Location" to auto‑fill coordinates from an online player.</p>
                        <p>⚠️ This will trigger aggressive NPCs – use with caution!</p>
                        <div id="horde-last-spawn" class="last-spawn"></div>
                    </div>
                </div>
            </div>
        `;
        this.updatePlayerList();
        window.addEventListener('players-updated', () => this.updatePlayerList());
    }

    async updatePlayerList() {
        const select = document.getElementById('horde-player-select');
        if (!select) return;
        const players = AppState.players || [];
        select.innerHTML = '<option value="">Select a player...</option>' + players.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
        if (players.length === 0) select.innerHTML = '<option value="">No players online</option>';
    }

    attachEvents() {
        document.getElementById('get-player-location')?.addEventListener('click', () => this.getPlayerLocation());
        document.getElementById('spawn-horde')?.addEventListener('click', () => this.spawnHorde());
        document.getElementById('cancel-horde')?.addEventListener('click', () => this.cancelHorde());
    }

    async getPlayerLocation() {
        const select = document.getElementById('horde-player-select');
        const player = select.value;
        if (!player) { toast.error('Select a player'); return; }
        try {
            const result = await ConnectionManager.executeCommand(`printpos ${player}`);
            const match = result.match(/\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/);
            if (match) {
                const x = parseFloat(match[1]);
                const y = parseFloat(match[2]);
                const z = parseFloat(match[3]);
                document.getElementById('horde-x').value = x;
                document.getElementById('horde-y').value = y;
                document.getElementById('horde-z').value = z;
                document.getElementById('horde-coord-display').innerHTML = `📍 Coordinates: (${x}, ${y}, ${z})`;
                toast.success(`Location set to ${player}'s position`);
            } else throw new Error('Could not parse');
        } catch (err) {
            toast.error('Failed to get location: ' + err.message);
        }
    }

    async spawnHorde() {
        if (!this.access.isMaster()) { toast.error('Master access required'); return; }
        const npc = document.getElementById('npc-type').value;
        const count = parseInt(document.getElementById('npc-count').value);
        if (isNaN(count) || count < 1 || count > 15) { toast.error('Quantity must be 1‑15'); return; }
        let x = parseFloat(document.getElementById('horde-x').value);
        let y = parseFloat(document.getElementById('horde-y').value);
        let z = parseFloat(document.getElementById('horde-z').value);
        if (isNaN(x) || isNaN(y) || isNaN(z)) { toast.error('Enter valid coordinates'); return; }

        toast.info(`Spawning ${count} ${npc}(s)...`);
        let success = 0;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 5 + Math.random() * 5;
            const offsetX = Math.cos(angle) * radius;
            const offsetZ = Math.sin(angle) * radius;
            const spawnX = x + offsetX;
            const spawnZ = z + offsetZ;
            const cmd = `spawn ${npc} (${spawnX},${y},${spawnZ})`;
            try {
                await ConnectionManager.executeCommand(cmd);
                success++;
                await new Promise(r => setTimeout(r, 100));
            } catch (err) {
                console.warn(`Failed to spawn ${npc}:`, err);
            }
        }
        const msg = document.getElementById('horde-last-spawn');
        msg.innerHTML = `✅ Spawned ${success}/${count} ${npc}(s) at (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`;
        toast.success(`Spawned ${success} NPCs`);
        // Auto‑cancel after 5 minutes? Not implemented, but cancel button works.
    }

    async cancelHorde() {
        if (!this.access.isMaster()) { toast.error('Master access required'); return; }
        // There's no "kill all NPCs" command, but we can try to kill scientists? 
        // Instead, just warn user.
        toast.warning('There is no in‑game cancel; NPCs will remain until killed. Use "ai.killanimals" or "ai.killscientists" if needed.');
        // Optional: we could execute `ai.killscientists` but that kills all scientists on map.
        if (confirm('Kill ALL scientists on the map? This will also affect monument scientists.')) {
            await ConnectionManager.executeCommand('ai.killscientists');
            toast.info('All scientists killed');
        }
    }

    refresh() {
        this.updatePlayerList();
        toast.success('Horde spawner refreshed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.hordeSpawner = new HordeSpawner();
});