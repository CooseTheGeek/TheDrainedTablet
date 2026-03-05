// ZONES SYSTEM - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class Zones {
    constructor(tablet) {
        this.tablet = tablet;
        this.zones = this.loadZones();
        this.monuments = this.loadMonuments();
        this.init();
    }

    loadZones() {
        const saved = localStorage.getItem('drained_zones');
        return saved ? JSON.parse(saved) : [];
    }

    loadMonuments() {
        return [
            { name: 'Dome', pos: [1200, 500], type: 'monument' },
            { name: 'Airfield', pos: [500, 2000], type: 'monument' },
            { name: 'Launch Site', pos: [3000, 2800], type: 'monument' },
            { name: 'Power Plant', pos: [2200, 1500], type: 'monument' },
            { name: 'Train Yard', pos: [1800, 2500], type: 'monument' },
            { name: 'Water Treatment', pos: [1000, 3000], type: 'monument' },
            { name: 'Large Oil Rig', pos: [3400, 3400], type: 'oilrig' },
            { name: 'Small Oil Rig', pos: [100, 100], type: 'oilrig' }
        ];
    }

    saveZones() {
        localStorage.setItem('drained_zones', JSON.stringify(this.zones));
    }

    init() {
        this.createZonesHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'zones') {
                this.refresh();
            }
        });
    }

    createZonesHTML() {
        const zonesTab = document.getElementById('tab-zones');
        if (!zonesTab) return;

        zonesTab.innerHTML = `
            <div class="zones-container">
                <div class="zones-header">
                    <h2>🗺️ ZONE MANAGEMENT</h2>
                    <button id="create-zone" class="zones-btn primary">+ CREATE ZONE</button>
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
                            <label>
                                <input type="checkbox" id="zone-pvp" checked>
                                Allow PvP Damage
                            </label>
                            <label>
                                <input type="checkbox" id="zone-npc" checked>
                                Allow NPC Damage
                            </label>
                            <label>
                                <input type="checkbox" id="zone-radiation" checked>
                                Enable Radiation
                            </label>
                            <label>
                                <input type="checkbox" id="zone-pvb" checked>
                                Allow Building Damage
                            </label>
                            <label>
                                <input type="checkbox" id="zone-build" checked>
                                Allow Building
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label>Radiation Amount:</label>
                            <input type="range" id="zone-radiation-amount" min="0" max="100" value="0">
                            <span id="radiation-value">0</span>
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

        this.renderZonesList();
        this.drawZoneMap();
    }

    setupEventListeners() {
        document.getElementById('create-zone')?.addEventListener('click', () => {
            document.getElementById('zone-modal').classList.remove('hidden');
        });

        document.getElementById('cancel-zone')?.addEventListener('click', () => {
            document.getElementById('zone-modal').classList.add('hidden');
        });

        document.getElementById('zone-monument')?.addEventListener('change', (e) => {
            const selected = e.target.selectedOptions[0];
            if (selected.value && selected.dataset.x) {
                document.getElementById('zone-x').value = selected.dataset.x;
                document.getElementById('zone-z').value = selected.dataset.z;
            }
        });

        document.getElementById('zone-radiation-amount')?.addEventListener('input', (e) => {
            document.getElementById('radiation-value').innerText = e.target.value;
        });

        document.getElementById('save-zone')?.addEventListener('click', () => this.saveZone());

        document.getElementById('close-edit')?.addEventListener('click', () => {
            document.getElementById('edit-zone-modal').classList.add('hidden');
        });

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

    saveZone() {
        const name = document.getElementById('zone-name').value;
        const x = parseInt(document.getElementById('zone-x').value);
        const y = parseInt(document.getElementById('zone-y').value);
        const z = parseInt(document.getElementById('zone-z').value);
        const radius = parseInt(document.getElementById('zone-radius').value);
        const rotation = parseInt(document.getElementById('zone-rotation').value);
        const shape = document.getElementById('zone-shape').value;
        const pvp = document.getElementById('zone-pvp').checked;
        const npc = document.getElementById('zone-npc').checked;
        const radiation = document.getElementById('zone-radiation').checked;
        const radiationAmount = parseInt(document.getElementById('zone-radiation-amount').value);
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
            name: name,
            position: { x, y, z },
            radius: radius,
            rotation: rotation,
            shape: shape,
            permissions: {
                pvp: pvp,
                npc: npc,
                radiation: radiation,
                radiationAmount: radiationAmount,
                buildingDamage: pvb,
                building: build
            },
            messages: {
                enter: enterMsg,
                leave: leaveMsg
            },
            color: color,
            enabled: true,
            created: new Date().toISOString()
        };

        this.zones.push(zone);
        this.saveZones();
        this.renderZonesList();
        this.drawZoneMap();

        document.getElementById('zone-modal').classList.add('hidden');
        this.tablet.showToast(`Zone "${name}" created`, 'success');
    }

    deleteZone(id) {
        this.tablet.showConfirm('Delete this zone?', (confirmed) => {
            if (confirmed) {
                this.zones = this.zones.filter(z => z.id !== id);
                this.saveZones();
                this.renderZonesList();
                this.drawZoneMap();
                this.tablet.showToast('Zone deleted', 'info');
            }
        });
    }

    openEditModal(id) {
        const zone = this.zones.find(z => z.id === id);
        if (!zone) return;

        document.getElementById('edit-zone-name').innerText = zone.name;
        document.getElementById('edit-zone-name').dataset.id = id;
        document.getElementById('edit-zone-modal').classList.remove('hidden');
    }

    handleZoneEdit(id, editType) {
        const zone = this.zones.find(z => z.id === id);
        if (!zone) return;

        switch(editType) {
            case 'enabled':
                zone.enabled = !zone.enabled;
                this.tablet.showToast(`Zone ${zone.enabled ? 'enabled' : 'disabled'}`, 'info');
                break;
                
            case 'position':
                const x = prompt('Enter new X coordinate:', zone.position.x);
                const y = prompt('Enter new Y coordinate:', zone.position.y);
                const z = prompt('Enter new Z coordinate:', zone.position.z);
                if (x && y && z) {
                    zone.position = { x: parseInt(x), y: parseInt(y), z: parseInt(z) };
                }
                break;
                
            case 'radius':
                const radius = prompt('Enter new radius:', zone.radius);
                if (radius) {
                    zone.radius = parseInt(radius);
                }
                break;
                
            case 'rotation':
                const rot = prompt('Enter new rotation:', zone.rotation);
                if (rot) {
                    zone.rotation = parseInt(rot);
                }
                break;
                
            case 'shape':
                zone.shape = zone.shape === 'sphere' ? 'box' : 'sphere';
                break;
                
            case 'pvp':
                zone.permissions.pvp = !zone.permissions.pvp;
                break;
                
            case 'npc':
                zone.permissions.npc = !zone.permissions.npc;
                break;
                
            case 'radiation':
                const rad = prompt('Enter radiation amount (0-100):', zone.permissions.radiationAmount);
                if (rad) {
                    zone.permissions.radiation = true;
                    zone.permissions.radiationAmount = parseInt(rad);
                }
                break;
                
            case 'build':
                zone.permissions.building = !zone.permissions.building;
                break;
                
            case 'color':
                const color = prompt('Enter color (hex, e.g., #FFB100):', zone.color);
                if (color) {
                    zone.color = color;
                }
                break;
                
            case 'messages':
                const enter = prompt('Enter enter message:', zone.messages.enter || '');
                const leave = prompt('Enter leave message:', zone.messages.leave || '');
                zone.messages.enter = enter;
                zone.messages.leave = leave;
                break;
        }

        this.saveZones();
        this.renderZonesList();
        this.drawZoneMap();
        this.tablet.showToast('Zone updated', 'success');
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
                        <div>PvP: ${zone.permissions.pvp ? '✅' : '❌'} · NPC: ${zone.permissions.npc ? '✅' : '❌'}</div>
                        <div>Building: ${zone.permissions.building ? '✅' : '❌'} · Radiation: ${zone.permissions.radiation ? zone.permissions.radiationAmount : '❌'}</div>
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
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();

            const y = (i / 10) * canvas.height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Draw monuments
        this.monuments.forEach(mon => {
            const x = (mon.pos[0] / 3500) * canvas.width;
            const y = (mon.pos[1] / 3500) * canvas.height;

            ctx.fillStyle = '#FFB100';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.font = '8px monospace';
            ctx.fillText(mon.name, x + 6, y - 6);
        });

        // Draw zones
        this.zones.forEach(zone => {
            const x = (zone.position.x / 3500) * canvas.width;
            const y = (zone.position.z / 3500) * canvas.height;
            const radius = (zone.radius / 3500) * canvas.width;

            ctx.strokeStyle = zone.color || '#FFB100';
            ctx.lineWidth = zone.enabled ? 2 : 1;
            ctx.setLineDash(zone.enabled ? [] : [5, 3]);

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.setLineDash([]);
            ctx.fillStyle = zone.color + '33';
            ctx.fill();

            ctx.fillStyle = zone.color;
            ctx.font = 'bold 10px monospace';
            ctx.fillText(zone.name, x - 20, y - radius - 5);
        });
    }

    refresh() {
        this.renderZonesList();
        this.drawZoneMap();
        this.tablet.showToast('Zones refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.zones = new Zones(window.drainedTablet);
});