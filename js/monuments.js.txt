// MONUMENTS MANAGER - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class MonumentsManager {
    constructor(tablet) {
        this.tablet = tablet;
        this.monuments = this.loadMonuments();
        this.recyclerLocations = this.loadRecyclers();
        this.init();
    }

    loadMonuments() {
        return [
            { id: 'dome', name: 'Dome', pos: [1200, 500], type: 'monument', recycler: false, guards: 0 },
            { id: 'airfield', name: 'Airfield', pos: [500, 2000], type: 'monument', recycler: false, guards: 4 },
            { id: 'launch_site', name: 'Launch Site', pos: [3000, 2800], type: 'monument', recycler: false, guards: 8 },
            { id: 'powerplant', name: 'Power Plant', pos: [2200, 1500], type: 'monument', recycler: false, guards: 5 },
            { id: 'trainyard', name: 'Train Yard', pos: [1800, 2500], type: 'monument', recycler: false, guards: 4 },
            { id: 'water_treatment', name: 'Water Treatment', pos: [1000, 3000], type: 'monument', recycler: false, guards: 3 },
            { id: 'lighthouse', name: 'Lighthouse', pos: [400, 3200], type: 'monument', recycler: false, guards: 0 },
            { id: 'sewer', name: 'Sewer Branch', pos: [2600, 400], type: 'monument', recycler: false, guards: 2 },
            { id: 'oxums', name: 'Oxum\'s Gas Station', pos: [1400, 1800], type: 'monument', recycler: true, guards: 1 },
            { id: 'quarry_sulfur', name: 'Sulfur Quarry', pos: [200, 800], type: 'quarry', recycler: false, guards: 0 },
            { id: 'quarry_stone', name: 'Stone Quarry', pos: [3200, 200], type: 'quarry', recycler: false, guards: 0 },
            { id: 'quarry_hqm', name: 'HQM Quarry', pos: [2800, 3200], type: 'quarry', recycler: false, guards: 0 },
            { id: 'satellite', name: 'Satellite Dish', pos: [600, 2600], type: 'monument', recycler: false, guards: 2 },
            { id: 'supermarket', name: 'Abandoned Supermarket', pos: [2000, 600], type: 'monument', recycler: true, guards: 1 },
            { id: 'oilrig_large', name: 'Large Oil Rig', pos: [3400, 3400], type: 'oilrig', recycler: true, guards: 12 },
            { id: 'oilrig_small', name: 'Small Oil Rig', pos: [100, 100], type: 'oilrig', recycler: true, guards: 8 },
            { id: 'military_tunnel', name: 'Military Tunnel', pos: [1400, 1400], type: 'monument', recycler: false, guards: 6 },
            { id: 'underwater_lab', name: 'Underwater Lab', pos: [2200, 2200], type: 'monument', recycler: true, guards: 5 },
            { id: 'mining_outpost', name: 'Mining Outpost', pos: [2400, 2400], type: 'outpost', recycler: true, guards: 3 },
            { id: 'junkyard', name: 'Junkyard', pos: [2800, 2800], type: 'monument', recycler: true, guards: 2 },
            { id: 'harbor_small', name: 'Small Harbor', pos: [800, 1200], type: 'harbor', recycler: false, guards: 2 },
            { id: 'harbor_large', name: 'Large Harbor', pos: [2800, 800], type: 'harbor', recycler: false, guards: 4 }
        ];
    }

    loadRecyclers() {
        const saved = localStorage.getItem('drained_recycler_locations');
        return saved ? JSON.parse(saved) : {};
    }

    saveRecyclers() {
        localStorage.setItem('drained_recycler_locations', JSON.stringify(this.recyclerLocations));
    }

    init() {
        this.createMonumentsHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'monuments') {
                this.refresh();
            }
        });
    }

    createMonumentsHTML() {
        const monumentsTab = document.getElementById('tab-monuments');
        if (!monumentsTab) return;

        monumentsTab.innerHTML = `
            <div class="monuments-container">
                <div class="monuments-header">
                    <h2>🏛️ MONUMENT CONTROLS</h2>
                    <div class="monument-controls">
                        <button id="refresh-monuments" class="monument-btn">🔄 REFRESH</button>
                        <button id="reset-monuments" class="monument-btn">🔄 RESET ALL</button>
                    </div>
                </div>

                <div class="monuments-tabs">
                    <button class="monument-tab active" data-type="all">ALL</button>
                    <button class="monument-tab" data-type="monument">🏛️ MONUMENTS</button>
                    <button class="monument-tab" data-type="oilrig">🛢️ OIL RIGS</button>
                    <button class="monument-tab" data-type="quarry">⛏️ QUARRIES</button>
                    <button class="monument-tab" data-type="harbor">⚓ HARBORS</button>
                </div>

                <div class="monuments-grid" id="monuments-grid"></div>

                <!-- Recycler Modal -->
                <div id="recycler-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3 id="recycler-modal-title">Enable Recycler</h3>
                        <p>Enable recycler at <span id="recycler-location"></span>?</p>
                        
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="recycler-force"> Force spawn now (no restart needed)
                            </label>
                        </div>
                        
                        <div class="warning-box">
                            ⚠️ Note: Enable recycler commands require a server restart unless "Force spawn" is checked.
                        </div>
                        
                        <div class="modal-actions">
                            <button id="enable-recycler" class="monument-btn primary">ENABLE</button>
                            <button id="disable-recycler" class="monument-btn warning">DISABLE</button>
                            <button id="cancel-recycler" class="monument-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderMonuments('all');
    }

    setupEventListeners() {
        document.getElementById('refresh-monuments')?.addEventListener('click', () => this.refresh());
        document.getElementById('reset-monuments')?.addEventListener('click', () => this.resetAll());

        document.querySelectorAll('.monument-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.monument-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.renderMonuments(e.target.dataset.type);
            });
        });

        document.getElementById('cancel-recycler')?.addEventListener('click', () => {
            document.getElementById('recycler-modal').classList.add('hidden');
        });

        document.getElementById('enable-recycler')?.addEventListener('click', () => this.toggleRecycler(true));
        document.getElementById('disable-recycler')?.addEventListener('click', () => this.toggleRecycler(false));

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('toggle-recycler')) {
                const monumentId = e.target.dataset.id;
                this.openRecyclerModal(monumentId);
            }
            if (e.target.classList.contains('spawn-guards')) {
                const monumentId = e.target.dataset.id;
                this.spawnGuards(monumentId);
            }
            if (e.target.classList.contains('view-on-map')) {
                const monumentId = e.target.dataset.id;
                this.viewOnMap(monumentId);
            }
        });
    }

    renderMonuments(type) {
        const grid = document.getElementById('monuments-grid');
        if (!grid) return;

        let filtered = this.monuments;
        if (type !== 'all') {
            filtered = filtered.filter(m => m.type === type);
        }

        let html = '';
        filtered.forEach(monument => {
            const hasRecycler = this.recyclerLocations[monument.id] || monument.recycler;
            html += `
                <div class="monument-card">
                    <div class="monument-header">
                        <span class="monument-name">${monument.name}</span>
                        <span class="monument-type">${monument.type}</span>
                    </div>
                    <div class="monument-body">
                        <div class="monument-pos">(${monument.pos[0]}, 0, ${monument.pos[1]})</div>
                        <div class="monument-stats">
                            <span>Guards: ${monument.guards}</span>
                            <span>Recycler: ${hasRecycler ? '✅' : '❌'}</span>
                        </div>
                    </div>
                    <div class="monument-actions">
                        <button class="small-btn toggle-recycler" data-id="${monument.id}">♻️ Recycler</button>
                        <button class="small-btn spawn-guards" data-id="${monument.id}">👮 Guards</button>
                        <button class="small-btn view-on-map" data-id="${monument.id}">🗺️ View</button>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    openRecyclerModal(monumentId) {
        const monument = this.monuments.find(m => m.id === monumentId);
        if (!monument) return;

        this.currentMonument = monument;
        document.getElementById('recycler-location').innerText = monument.name;
        document.getElementById('recycler-modal').classList.remove('hidden');
    }

    toggleRecycler(enable) {
        if (!this.currentMonument) return;

        const force = document.getElementById('recycler-force').checked;
        const monumentId = this.currentMonument.id;

        if (enable) {
            this.recyclerLocations[monumentId] = true;
            this.tablet.showToast(`Recycler ${force ? 'force spawned' : 'enabled'} at ${this.currentMonument.name}`, 'success');
        } else {
            delete this.recyclerLocations[monumentId];
            this.tablet.showToast(`Recycler disabled at ${this.currentMonument.name}`, 'info');
        }

        this.saveRecyclers();
        this.renderMonuments(document.querySelector('.monument-tab.active').dataset.type);
        document.getElementById('recycler-modal').classList.add('hidden');
    }

    spawnGuards(monumentId) {
        const monument = this.monuments.find(m => m.id === monumentId);
        if (!monument) return;

        const count = prompt(`Enter number of guards to spawn at ${monument.name}:`, monument.guards.toString());
        if (count) {
            monument.guards = parseInt(count);
            this.tablet.showToast(`Spawned ${count} guards at ${monument.name}`, 'success');
            this.renderMonuments(document.querySelector('.monument-tab.active').dataset.type);
        }
    }

    viewOnMap(monumentId) {
        const monument = this.monuments.find(m => m.id === monumentId);
        if (!monument) return;

        this.tablet.switchTab('livemap');
        // Would center map on monument
        this.tablet.showToast(`Viewing ${monument.name} on map`, 'info');
    }

    resetAll() {
        this.tablet.showConfirm('Reset all monument settings?', (confirmed) => {
            if (confirmed) {
                this.recyclerLocations = {};
                this.monuments.forEach(m => {
                    m.guards = m.type === 'oilrig' ? (m.id.includes('large') ? 12 : 8) : 
                               m.type === 'monument' ? 4 : 0;
                });
                this.saveRecyclers();
                this.renderMonuments(document.querySelector('.monument-tab.active').dataset.type);
                this.tablet.showToast('Monument settings reset', 'success');
            }
        });
    }

    refresh() {
        this.renderMonuments(document.querySelector('.monument-tab.active').dataset.type);
        this.tablet.showToast('Monuments refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.monumentsManager = new MonumentsManager(window.drainedTablet);
});