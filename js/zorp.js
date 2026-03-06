// ZORP ZONES - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class ZorpZones {
    constructor(tablet) {
        this.tablet = tablet;
        this.zones = this.loadZones();
        this.init();
    }

    loadZones() {
        const saved = localStorage.getItem('drained_zorp_zones');
        return saved ? JSON.parse(saved) : [];
    }

    saveZones() {
        localStorage.setItem('drained_zorp_zones', JSON.stringify(this.zones));
    }

    init() {
        this.createZorpHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'zorp') {
                this.refresh();
            }
        });
    }

    createZorpHTML() {
        const zorpTab = document.getElementById('tab-zorp');
        if (!zorpTab) return;

        zorpTab.innerHTML = `
            <div class="zorp-container">
                <div class="zorp-header">
                    <h2>🎮 ZORP ZONE MANAGER</h2>
                    <button id="create-zorp" class="zorp-btn primary">+ NEW ZORP ZONE</button>
                </div>

                <div class="zorp-grid">
                    <div class="zorp-list" id="zorp-list"></div>
                    
                    <div class="zorp-info">
                        <h3>ZORP ZONE INFO</h3>
                        <div id="zorp-details" class="zorp-details">
                            <p>Select a zone to view details</p>
                        </div>
                    </div>
                </div>

                <!-- Create ZORP Modal -->
                <div id="zorp-modal" class="modal hidden">
                    <div class="modal-content zorp-modal">
                        <h2>CREATE ZORP ZONE</h2>
                        
                        <div class="form-group">
                            <label>Zone Name:</label>
                            <input type="text" id="zorp-name" placeholder="e.g., PvP Arena">
                        </div>
                        
                        <div class="form-group">
                            <label>Position:</label>
                            <div class="coord-inputs">
                                <input type="number" id="zorp-x" placeholder="X" value="0">
                                <input type="number" id="zorp-y" placeholder="Y" value="0">
                                <input type="number" id="zorp-z" placeholder="Z" value="0">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Radius:</label>
                            <input type="number" id="zorp-radius" value="50" min="1">
                        </div>
                        
                        <h4>ZONE FLAGS</h4>
                        
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="zorp-nopvp">
                                No PvP
                            </label>
                            <label>
                                <input type="checkbox" id="zorp-nobuild">
                                No Building
                            </label>
                            <label>
                                <input type="checkbox" id="zorp-nonpc">
                                No NPC Damage
                            </label>
                            <label>
                                <input type="checkbox" id="zorp-noheal">
                                No Healing
                            </label>
                            <label>
                                <input type="checkbox" id="zorp-noloot">
                                No Loot
                            </label>
                            <label>
                                <input type="checkbox" id="zorp-safe">
                                Safe Zone
                            </label>
                            <label>
                                <input type="checkbox" id="zorp-radiation">
                                Radiation Zone
                            </label>
                            <label>
                                <input type="checkbox" id="zorp-kill">
                                Kill Zone
                            </label>
                        </div>
                        
                        <div class="form-group" id="radiation-group" style="display: none;">
                            <label>Radiation Amount:</label>
                            <input type="range" id="zorp-radiation-amount" min="0" max="100" value="10">
                            <span id="zorp-radiation-value">10</span>
                        </div>
                        
                        <div class="form-group">
                            <label>Enter Message:</label>
                            <input type="text" id="zorp-enter-msg" placeholder="Entering ZORP zone">
                        </div>
                        
                        <div class="form-group">
                            <label>Leave Message:</label>
                            <input type="text" id="zorp-leave-msg" placeholder="Leaving ZORP zone">
                        </div>
                        
                        <div class="modal-actions">
                            <button id="save-zorp" class="zorp-btn primary">CREATE ZONE</button>
                            <button id="cancel-zorp" class="zorp-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderZones();
    }

    setupEventListeners() {
        document.getElementById('create-zorp')?.addEventListener('click', () => {
            document.getElementById('zorp-modal').classList.remove('hidden');
        });

        document.getElementById('cancel-zorp')?.addEventListener('click', () => {
            document.getElementById('zorp-modal').classList.add('hidden');
        });

        document.getElementById('save-zorp')?.addEventListener('click', () => this.saveZone());

        document.getElementById('zorp-radiation')?.addEventListener('change', (e) => {
            const group = document.getElementById('radiation-group');
            group.style.display = e.target.checked ? 'block' : 'none';
        });

        document.getElementById('zorp-radiation-amount')?.addEventListener('input', (e) => {
            document.getElementById('zorp-radiation-value').innerText = e.target.value;
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-zorp')) {
                const id = e.target.dataset.id;
                this.viewZone(id);
            }
            if (e.target.classList.contains('edit-zorp')) {
                const id = e.target.dataset.id;
                this.editZone(id);
            }
            if (e.target.classList.contains('rename-zorp')) {
                const id = e.target.dataset.id;
                this.renameZone(id);
            }
            if (e.target.classList.contains('delete-zorp')) {
                const id = e.target.dataset.id;
                this.deleteZone(id);
            }
            if (e.target.classList.contains('toggle-zorp')) {
                const id = e.target.dataset.id;
                this.toggleZone(id);
            }
        });
    }

    saveZone() {
        const name = document.getElementById('zorp-name').value;
        const x = parseInt(document.getElementById('zorp-x').value);
        const y = parseInt(document.getElementById('zorp-y').value);
        const z = parseInt(document.getElementById('zorp-z').value);
        const radius = parseInt(document.getElementById('zorp-radius').value);

        const flags = {
            nopvp: document.getElementById('zorp-nopvp').checked,
            nobuild: document.getElementById('zorp-nobuild').checked,
            nonpc: document.getElementById('zorp-nonpc').checked,
            noheal: document.getElementById('zorp-noheal').checked,
            noloot: document.getElementById('zorp-noloot').checked,
            safe: document.getElementById('zorp-safe').checked,
            radiation: document.getElementById('zorp-radiation').checked,
            kill: document.getElementById('zorp-kill').checked
        };

        const radiationAmount = flags.radiation ? parseInt(document.getElementById('zorp-radiation-amount').value) : 0;
        const enterMsg = document.getElementById('zorp-enter-msg').value;
        const leaveMsg = document.getElementById('zorp-leave-msg').value;

        if (!name) {
            this.tablet.showError('Zone name required');
            return;
        }

        const zone = {
            id: 'zorp_' + Date.now(),
            name: name,
            position: { x, y, z },
            radius: radius,
            flags: flags,
            radiationAmount: radiationAmount,
            messages: {
                enter: enterMsg,
                leave: leaveMsg
            },
            enabled: true,
            created: new Date().toISOString()
        };

        this.zones.push(zone);
        this.saveZones();
        this.renderZones();

        document.getElementById('zorp-modal').classList.add('hidden');
        this.tablet.showToast(`ZORP zone "${name}" created`, 'success');
    }

    renderZones() {
        const container = document.getElementById('zorp-list');
        if (!container) return;

        if (this.zones.length === 0) {
            container.innerHTML = '<div class="no-zones">No ZORP zones created</div>';
            return;
        }

        let html = '';
        this.zones.forEach(zone => {
            const flagCount = Object.values(zone.flags).filter(v => v).length;
            html += `
                <div class="zorp-card ${zone.enabled ? 'enabled' : 'disabled'}">
                    <div class="zorp-header">
                        <span class="zorp-name">${zone.name}</span>
                        <span class="zorp-status">${zone.enabled ? '🟢' : '⚫'}</span>
                    </div>
                    <div class="zorp-body">
                        <div>Position: (${zone.position.x}, ${zone.position.y}, ${zone.position.z})</div>
                        <div>Radius: ${zone.radius}m</div>
                        <div>Flags: ${flagCount} active</div>
                    </div>
                    <div class="zorp-actions">
                        <button class="zorp-btn small view-zorp" data-id="${zone.id}">👁️ VIEW</button>
                        <button class="zorp-btn small edit-zorp" data-id="${zone.id}">✏️ EDIT</button>
                        <button class="zorp-btn small rename-zorp" data-id="${zone.id}">📝 RENAME</button>
                        <button class="zorp-btn small toggle-zorp" data-id="${zone.id}">${zone.enabled ? '⏸️' : '▶️'}</button>
                        <button class="zorp-btn small delete-zorp" data-id="${zone.id}">🗑️</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    viewZone(id) {
        const zone = this.zones.find(z => z.id === id);
        if (!zone) return;

        const details = document.getElementById('zorp-details');
        
        let flagsHtml = '<ul>';
        if (zone.flags.nopvp) flagsHtml += '<li>🚫 No PvP</li>';
        if (zone.flags.nobuild) flagsHtml += '<li>🚫 No Building</li>';
        if (zone.flags.nonpc) flagsHtml += '<li>🚫 No NPC Damage</li>';
        if (zone.flags.noheal) flagsHtml += '<li>🚫 No Healing</li>';
        if (zone.flags.noloot) flagsHtml += '<li>🚫 No Loot</li>';
        if (zone.flags.safe) flagsHtml += '<li>🛡️ Safe Zone</li>';
        if (zone.flags.radiation) flagsHtml += `<li>☢️ Radiation: ${zone.radiationAmount}</li>`;
        if (zone.flags.kill) flagsHtml += '<li>💀 Kill Zone</li>';
        flagsHtml += '</ul>';

        details.innerHTML = `
            <h4>${zone.name}</h4>
            <p><strong>Position:</strong> (${zone.position.x}, ${zone.position.y}, ${zone.position.z})</p>
            <p><strong>Radius:</strong> ${zone.radius}m</p>
            <p><strong>Status:</strong> ${zone.enabled ? '🟢 Active' : '⚫ Disabled'}</p>
            <p><strong>Flags:</strong></p>
            ${flagsHtml}
            <p><strong>Enter:</strong> "${zone.messages.enter || 'none'}"</p>
            <p><strong>Leave:</strong> "${zone.messages.leave || 'none'}"</p>
            <p><strong>Created:</strong> ${new Date(zone.created).toLocaleString()}</p>
        `;
    }

    editZone(id) {
        const zone = this.zones.find(z => z.id === id);
        if (!zone) return;

        const newRadius = prompt('Enter new radius:', zone.radius);
        if (newRadius) {
            zone.radius = parseInt(newRadius);
            this.saveZones();
            this.renderZones();
            this.viewZone(id);
            this.tablet.showToast('Zone updated', 'success');
        }
    }

    renameZone(id) {
        const zone = this.zones.find(z => z.id === id);
        if (!zone) return;

        const newName = prompt('Enter new zone name:', zone.name);
        if (newName) {
            zone.name = newName;
            this.saveZones();
            this.renderZones();
            this.viewZone(id);
            this.tablet.showToast('Zone renamed', 'success');
        }
    }

    toggleZone(id) {
        const zone = this.zones.find(z => z.id === id);
        if (zone) {
            zone.enabled = !zone.enabled;
            this.saveZones();
            this.renderZones();
            this.viewZone(id);
            this.tablet.showToast(`Zone ${zone.enabled ? 'enabled' : 'disabled'}`, 'info');
        }
    }

    deleteZone(id) {
        this.tablet.showConfirm('Delete this ZORP zone?', (confirmed) => {
            if (confirmed) {
                this.zones = this.zones.filter(z => z.id !== id);
                this.saveZones();
                this.renderZones();
                document.getElementById('zorp-details').innerHTML = '<p>Select a zone to view details</p>';
                this.tablet.showToast('Zone deleted', 'info');
            }
        });
    }

    refresh() {
        this.renderZones();
        this.tablet.showToast('ZORP zones refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.zorpZones = new ZorpZones(window.drainedTablet);
});