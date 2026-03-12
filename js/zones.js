// zones.js – DRAINED TABLET ULTIMATE v7.0.0
// Zone management: create, edit, delete, and visualize custom zones.
// Uses bridge database for persistent storage and RCON for server commands.

class Zones {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.db = window.database;
        this.zones = [];
        this.monuments = this.getMonumentList();
        this.init();
    }

    getMonumentList() {
        return [
            { name: 'Dome', pos: [1245, 678] },
            { name: 'Airfield', pos: [500, 2000] },
            { name: 'Launch Site', pos: [3000, 2800] },
            { name: 'Power Plant', pos: [2200, 1500] },
            { name: 'Train Yard', pos: [1800, 2500] },
            { name: 'Water Treatment', pos: [1000, 3000] },
            { name: 'Large Oil Rig', pos: [3400, 3400] },
            { name: 'Small Oil Rig', pos: [100, 100] }
        ];
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.loadZones();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'zones') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-zones');
        if (!tab) return;

        if (!this.access.hasRole('owner')) {
            tab.innerHTML = '<div class="access-denied">Owner access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="zones-container">
                <div class="zones-header">
                    <h2>🗺️ ZONE MANAGEMENT</h2>
                    <button id="create-zone" class="zones-btn primary">➕ CREATE ZONE</button>
                </div>

                <div class="zones-grid">
                    <div class="zones-list">
                        <h3>EXISTING ZONES</h3>
                        <div id="zones-list-container"></div>
                    </div>
                    <div class="zone-map">
                        <h3>ZONE MAP</h3>
                        <canvas id="zones-map-canvas" width="600" height="400"></canvas>
                    </div>
                </div>

                <!-- Create Zone Modal -->
                <div id="zone-modal" class="modal hidden">
                    <div class="modal-content zones-modal">
                        <h2>CREATE ZONE</h2>
                        
                        <div class="form-group">
                            <label>Zone Name:</label>
                            <input type="text" id="zone-name" placeholder="e.g., Safe Zone">
                        </div>
                        
                        <div class="form-group">
                            <label>Position:</label>
                            <div class="coord-inputs">
                                <input type="number" id="zone-x" placeholder="X" value="0">
                                <input type="number" id="zone-y" placeholder="Y" value="0">
                                <input type="number" id="zone-z" placeholder="Z" value="0">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Radius:</label>
                            <input type="number" id="zone-radius" value="50" min="1">
                        </div>
                        
                        <div class="form-group">
                            <label>Rotation:</label>
                            <input type="number" id="zone-rotation" value="0" min="0" max="360">
                        </div>
                        
                        <div class="form-group">
                            <label>Shape:</label>
                            <select id="zone-shape">
                                <option value="sphere">Sphere</option>
                                <option value="box">Box</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Monument Preset:</label>
                            <select id="zone-monument">
                                <option value="">Manual Position</option>
                                ${this.monuments.map(m => `<option value="${m.name}" data-x="${m.pos[0]}" data-z="${m.pos[1]}">${m.name}</option>`).join('')}
                            </select>
                        </div>
                        
                        <h4>PERMISSIONS</h4>
                        <div class="checkbox-group">
                            <label><input type="checkbox" id="zone-pvp" checked> Allow PvP Damage</label>
                            <label><input type="checkbox" id="zone-npc" checked> Allow NPC Damage</label>
                            <label><input type="checkbox" id="zone-radiation"> Enable Radiation</label>
                            <label><input type="checkbox" id="zone-pvb" checked> Allow Building Damage</label>
                            <label><input type="checkbox" id="zone-build" checked> Allow Building</label>
                        </div>
                        
                        <div class="form-group" id="radiation-group" style="display: none;">
                            <label>Radiation Amount: <span id="radiation-value">0</span></label>
                            <input type="range" id="zone-radiation-amount" min="0" max="100" value="0">
                        </div>
                        
                        <div class="form-group">
                            <label>Enter Message (optional):</label>
                            <input type="text" id="zone-enter-msg" placeholder="Welcome to the zone">
                        </div>
                        
                        <div class="form-group">
                            <label>Leave Message (optional):</label>
                            <input type="text" id="zone-leave-msg" placeholder="Leaving the zone">
                        </div>
                        
                        <div class="form-group">
                            <label>Zone Color:</label>
                            <input type="color" id="zone-color" value="#FFB100">
                        </div>
                        
                        <div class="modal-actions">
                            <button id="save-zone" class="zones-btn primary">CREATE ZONE</button>
                            <button id="cancel-zone" class="zones-btn">CANCEL</button>
                        </div>
                    </div>
                </div>

                <!-- Edit Zone Modal -->
                <div id="edit-zone-modal" class="modal hidden">
                    <div class="modal-content zones-modal">
                        <h2>EDIT ZONE: <span id="edit-zone-name"></span></h2>
                        <div class="edit-options">
                            <button class="edit-option" data-edit="enabled">Toggle Enabled</button>
                            <button class="edit-option" data-edit="position">Edit Position</button>
                            <button class="edit-option" data-edit="radius">Edit Radius</button>
                            <button class="edit-option" data-edit="rotation">Edit Rotation</button>
                            <button class="edit-option" data-edit="shape">Edit Shape</button>
                            <button class="edit-option" data-edit="pvp">Toggle PvP</button>
                            <button class="edit-option" data-edit="npc">Toggle NPC</button>
                            <button class="edit-option" data-edit="radiation">Edit Radiation</button>
                            <button class="edit-option" data-edit="build">Toggle Building</button>
                            <button class="edit-option" data-edit="color">Edit Color</button>
                            <button class="edit-option" data-edit="messages">Edit Messages</button>
                        </div>
                        <div class="modal-actions">
                            <button id="close-edit" class="zones-btn">CLOSE</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachModalListeners();
    }

    attachEvents() {
        document.getElementById('create-zone')?.addEventListener('click', () => this.openCreateModal());
        document.getElementById('save-zone')?.addEventListener('click', () => this.saveZone());
        document.getElementById('cancel-zone')?.addEventListener('click', () => {
            document.getElementById('zone-modal').classList.add('hidden');
        });
        document.getElementById('close-edit')?.addEventListener('click', () => {
            document.getElementById('edit-zone-modal').classList.add('hidden');
        });

        document.getElementById('zone-radiation')?.addEventListener('change', (e) => {
            const group = document.getElementById('radiation-group');
            group.style.display = e.target.checked ? 'block' : 'none';
        });
        document.getElementById('zone-radiation-amount')?.addEventListener('input', (e) => {
            document.getElementById('radiation-value').innerText = e.target.value;
        });
        document.getElementById('zone-monument')?.addEventListener('change', (e) => {
            const selected = e.target.selectedOptions[0];
            if (selected.dataset.x) {
                document.getElementById('zone-x').value = selected.dataset.x;
                document.getElementById('zone-z').value = selected.dataset.z;
            }
        });
    }

    attachModalListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-zone')) {
                const id = e.target.dataset.id;
                this.openEditModal(id);
            }
            if (e.target.classList.contains('delete-zone')) {
                const id = e.target.dataset.id;
                this.deleteZone(id);
            }
            if (e.target.classList.contains('edit-option')) {
                const editType = e.target.dataset.edit;
                const zoneId = document.getElementById('edit-zone-name').dataset.id;
                this.handleZoneEdit(zoneId, editType);
            }
        });
    }

    async loadZones() {
        try {
            this.zones = await this.db.getZones();
            this.renderZonesList();
            this.drawZoneMap();
        } catch (err) {
            this.tablet.showError('Failed to load zones');
        }
    }

    renderZonesList() {
        const container = document.getElementById('zones-list-container');
        if (!container) return;
        if (this.zones.length === 0) {
            container.innerHTML = '<div class="no-zones">No zones created</div>';
            return;
        }
        let html = '';
        this.zones.forEach(zone => {
            html += `
                <div class="zone-card ${zone.enabled ? 'enabled' : 'disabled'}">
                    <div class="zone-header">
                        <span class="zone-name">${zone.name}</span>
                        <span class="zone-status">${zone.enabled ? '🟢 ACTIVE' : '⚫ DISABLED'}</span>
                    </div>
                    <div class="zone-body">
                        <div>Position: (${zone.position.x}, ${zone.position.y}, ${zone.position.z})</div>
                        <div>Radius: ${zone.radius}m · Shape: ${zone.shape}</div>
                        <div>PvP: ${zone.flags?.pvp ? '✅' : '❌'} · NPC: ${zone.flags?.npc ? '✅' : '❌'}</div>
                        <div>Building: ${zone.flags?.building ? '✅' : '❌'} · Radiation: ${zone.flags?.radiation ? zone.flags.radiationAmount : '❌'}</div>
                    </div>
                    <div class="zone-actions">
                        <button class="zone-btn edit-zone" data-id="${zone.id}">✏️ EDIT</button>
                        <button class="zone-btn delete-zone" data-id="${zone.id}">🗑️ DELETE</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    drawZoneMap() {
        const canvas = document.getElementById('zones-map-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 177, 0, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * canvas.width;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            const y = (i / 10) * canvas.height;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        // Draw monuments
        this.monuments.forEach(m => {
            const x = (m.pos[0] / 3500) * canvas.width;
            const y = (m.pos[1] / 3500) * canvas.height;
            ctx.fillStyle = '#FFB100';
            ctx.beginPath(); ctx.arc(x, y, 4, 0, 2 * Math.PI); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = '8px monospace';
            ctx.fillText(m.name, x + 6, y - 6);
        });

        // Draw zones
        this.zones.forEach(zone => {
            const x = (zone.position.x / 3500) * canvas.width;
            const y = (zone.position.z / 3500) * canvas.height;
            const radius = (zone.radius / 3500) * canvas.width;
            ctx.strokeStyle = zone.color || '#FFB100';
            ctx.lineWidth = zone.enabled ? 2 : 1;
            ctx.setLineDash(zone.enabled ? [] : [5, 3]);
            ctx.beginPath(); ctx.arc(x, y, radius, 0, 2 * Math.PI); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = (zone.color || '#FFB100') + '33';
            ctx.fill();
            ctx.fillStyle = zone.color || '#FFB100';
            ctx.font = 'bold 10px monospace';
            ctx.fillText(zone.name, x - 20, y - radius - 5);
        });
    }

    openCreateModal() {
        document.getElementById('zone-modal').classList.remove('hidden');
    }

    async saveZone() {
        const name = document.getElementById('zone-name').value;
        const x = parseInt(document.getElementById('zone-x').value);
        const y = parseInt(document.getElementById('zone-y').value);
        const z = parseInt(document.getElementById('zone-z').value);
        const radius = parseInt(document.getElementById('zone-radius').value);
        const rotation = parseInt(document.getElementById('zone-rotation').value);
        const shape = document.getElementById('zone-shape').value;
        const pvp = document.getElementById('zone-pvp').checked;
        const npc = document.getElementById('zone-npc').checked;
        const radiationEnabled = document.getElementById('zone-radiation').checked;
        const radiationAmount = radiationEnabled ? parseInt(document.getElementById('zone-radiation-amount').value) : 0;
        const pvb = document.getElementById('zone-pvb').checked;
        const build = document.getElementById('zone-build').checked;
        const enterMsg = document.getElementById('zone-enter-msg').value;
        const leaveMsg = document.getElementById('zone-leave-msg').value;
        const color = document.getElementById('zone-color').value;

        if (!name) {
            this.tablet.showError('Zone name required');
            return;
        }

        const zone = {
            id: 'zone_' + Date.now(),
            name,
            position: { x, y, z },
            radius,
            rotation,
            shape,
            flags: { pvp, npc, radiation: radiationEnabled, radiationAmount, buildingDamage: pvb, building: build },
            messages: { enter: enterMsg, leave: leaveMsg },
            color,
            enabled: true,
            created: new Date().toISOString()
        };

        const success = await this.db.saveZone(zone);
        if (success) {
            this.zones.push(zone);
            this.renderZonesList();
            this.drawZoneMap();
            document.getElementById('zone-modal').classList.add('hidden');
            this.tablet.showToast(`Zone "${name}" created`, 'success');
        } else {
            this.tablet.showError('Failed to save zone');
        }
    }

    async deleteZone(id) {
        if (!confirm('Delete this zone?')) return;
        const success = await this.db.deleteZone(id);
        if (success) {
            this.zones = this.zones.filter(z => z.id !== id);
            this.renderZonesList();
            this.drawZoneMap();
            this.tablet.showToast('Zone deleted', 'info');
        } else {
            this.tablet.showError('Failed to delete zone');
        }
    }

    openEditModal(id) {
        const zone = this.zones.find(z => z.id === id);
        if (!zone) return;
        document.getElementById('edit-zone-name').innerText = zone.name;
        document.getElementById('edit-zone-name').dataset.id = id;
        document.getElementById('edit-zone-modal').classList.remove('hidden');
    }

    async handleZoneEdit(id, editType) {
        const zone = this.zones.find(z => z.id === id);
        if (!zone) return;

        switch(editType) {
            case 'enabled':
                zone.enabled = !zone.enabled;
                break;
            case 'position':
                const x = prompt('Enter new X coordinate:', zone.position.x);
                const y = prompt('Enter new Y coordinate:', zone.position.y);
                const z = prompt('Enter new Z coordinate:', zone.position.z);
                if (x && y && z) zone.position = { x: parseFloat(x), y: parseFloat(y), z: parseFloat(z) };
                break;
            case 'radius':
                const r = prompt('Enter new radius:', zone.radius);
                if (r) zone.radius = parseFloat(r);
                break;
            case 'rotation':
                const rot = prompt('Enter new rotation:', zone.rotation);
                if (rot) zone.rotation = parseFloat(rot);
                break;
            case 'shape':
                zone.shape = zone.shape === 'sphere' ? 'box' : 'sphere';
                break;
            case 'pvp':
                zone.flags.pvp = !zone.flags.pvp;
                break;
            case 'npc':
                zone.flags.npc = !zone.flags.npc;
                break;
            case 'radiation':
                const rad = prompt('Enter radiation amount (0-100):', zone.flags.radiationAmount || 0);
                if (rad) {
                    zone.flags.radiation = true;
                    zone.flags.radiationAmount = parseFloat(rad);
                } else {
                    zone.flags.radiation = false;
                }
                break;
            case 'build':
                zone.flags.building = !zone.flags.building;
                break;
            case 'color':
                const col = prompt('Enter new color (hex, e.g., #FFB100):', zone.color);
                if (col) zone.color = col;
                break;
            case 'messages':
                const enter = prompt('Enter enter message:', zone.messages?.enter || '');
                const leave = prompt('Enter leave message:', zone.messages?.leave || '');
                zone.messages = { enter, leave };
                break;
        }

        await this.db.saveZone(zone);
        this.renderZonesList();
        this.drawZoneMap();
        this.tablet.showToast('Zone updated', 'success');
    }

    refresh() {
        this.loadZones();
        this.tablet.showToast('Zones refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.zones = new Zones();
});