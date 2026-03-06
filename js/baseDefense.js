// BASE DEFENSE SIMULATOR - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class BaseDefense {
    constructor(tablet) {
        this.tablet = tablet;
        this.bases = this.loadBases();
        this.currentBase = null;
        this.init();
    }

    loadBases() {
        const saved = localStorage.getItem('drained_bases');
        return saved ? JSON.parse(saved) : [
            {
                id: 'base_1',
                name: 'RustGod\'s Base',
                owner: 'RustGod',
                location: { x: 1245, z: 678 },
                walls: {
                    stone: 24,
                    metal: 12,
                    armored: 4,
                    hqm: 2
                },
                doors: {
                    wood: 2,
                    metal: 3,
                    armored: 1
                },
                tc: true,
                cupboards: 1
            }
        ];
    }

    saveBases() {
        localStorage.setItem('drained_bases', JSON.stringify(this.bases));
    }

    init() {
        this.createDefenseHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'defense') {
                this.refresh();
            }
        });
    }

    createDefenseHTML() {
        const defenseTab = document.getElementById('tab-defense');
        if (!defenseTab) return;

        defenseTab.innerHTML = `
            <div class="defense-container">
                <div class="defense-header">
                    <h2>🛡️ BASE DEFENSE SIMULATOR</h2>
                    <button id="add-base" class="defense-btn primary">➕ ADD BASE</button>
                </div>

                <div class="defense-grid">
                    <div class="base-selector">
                        <h3>SELECT BASE</h3>
                        <select id="base-select" class="base-dropdown">
                            <option value="">Choose a base...</option>
                            ${this.bases.map(base => `<option value="${base.id}">${base.name}</option>`).join('')}
                        </select>
                        <button id="load-base" class="defense-btn">LOAD BASE</button>
                    </div>

                    <div class="simulator-panel" id="simulator-panel">
                        <div class="base-info">
                            <h3 id="sim-base-name">No base selected</h3>
                            <div id="base-details"></div>
                        </div>

                        <div class="attack-controls">
                            <h4>⚔️ ATTACK SIMULATION</h4>
                            
                            <div class="form-group">
                                <label>Attack Method:</label>
                                <select id="attack-method">
                                    <option value="c4">C4</option>
                                    <option value="rocket">Rockets</option>
                                    <option value="satchel">Satchels</option>
                                    <option value="pick">Pickaxe</option>
                                    <option value="jackhammer">Jackhammer</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Quantity:</label>
                                <input type="number" id="attack-quantity" value="10" min="1">
                            </div>
                            
                            <button id="simulate-attack" class="defense-btn primary">🎯 SIMULATE</button>
                        </div>

                        <div class="simulation-result" id="sim-result"></div>

                        <div class="defense-tips" id="defense-tips"></div>
                    </div>

                    <div class="weakness-analysis">
                        <h3>🔍 WEAKNESS ANALYSIS</h3>
                        <div id="weakness-list"></div>
                    </div>
                </div>

                <!-- Add Base Modal -->
                <div id="base-modal" class="modal hidden">
                    <div class="modal-content">
                        <h2>ADD BASE</h2>
                        
                        <div class="form-group">
                            <label>Base Name:</label>
                            <input type="text" id="base-name" placeholder="e.g., My Base">
                        </div>
                        
                        <div class="form-group">
                            <label>Owner:</label>
                            <input type="text" id="base-owner" placeholder="Player name">
                        </div>
                        
                        <div class="form-group">
                            <label>Location:</label>
                            <div class="coord-inputs">
                                <input type="number" id="base-x" placeholder="X" value="0">
                                <input type="number" id="base-z" placeholder="Z" value="0">
                            </div>
                        </div>
                        
                        <h4>WALLS</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Stone:</label>
                                <input type="number" id="walls-stone" value="0" min="0">
                            </div>
                            <div class="form-group">
                                <label>Metal:</label>
                                <input type="number" id="walls-metal" value="0" min="0">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Armored:</label>
                                <input type="number" id="walls-armored" value="0" min="0">
                            </div>
                            <div class="form-group">
                                <label>HQM:</label>
                                <input type="number" id="walls-hqm" value="0" min="0">
                            </div>
                        </div>
                        
                        <h4>DOORS</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Wood:</label>
                                <input type="number" id="doors-wood" value="0" min="0">
                            </div>
                            <div class="form-group">
                                <label>Metal:</label>
                                <input type="number" id="doors-metal" value="0" min="0">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Armored:</label>
                                <input type="number" id="doors-armored" value="0" min="0">
                            </div>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="has-tc" checked>
                                Has Tool Cupboard
                            </label>
                        </div>
                        
                        <div class="modal-actions">
                            <button id="save-base" class="defense-btn primary">SAVE BASE</button>
                            <button id="cancel-base" class="defense-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('add-base')?.addEventListener('click', () => this.openBaseModal());
        document.getElementById('load-base')?.addEventListener('click', () => this.loadBase());
        document.getElementById('simulate-attack')?.addEventListener('click', () => this.simulateAttack());
        document.getElementById('save-base')?.addEventListener('click', () => this.saveBase());
        document.getElementById('cancel-base')?.addEventListener('click', () => {
            document.getElementById('base-modal').classList.add('hidden');
        });
    }

    openBaseModal() {
        document.getElementById('base-modal').classList.remove('hidden');
    }

    saveBase() {
        const name = document.getElementById('base-name').value;
        const owner = document.getElementById('base-owner').value;

        if (!name || !owner) {
            this.tablet.showError('Name and owner required');
            return;
        }

        const base = {
            id: 'base_' + Date.now(),
            name: name,
            owner: owner,
            location: {
                x: parseInt(document.getElementById('base-x').value),
                z: parseInt(document.getElementById('base-z').value)
            },
            walls: {
                stone: parseInt(document.getElementById('walls-stone').value),
                metal: parseInt(document.getElementById('walls-metal').value),
                armored: parseInt(document.getElementById('walls-armored').value),
                hqm: parseInt(document.getElementById('walls-hqm').value)
            },
            doors: {
                wood: parseInt(document.getElementById('doors-wood').value),
                metal: parseInt(document.getElementById('doors-metal').value),
                armored: parseInt(document.getElementById('doors-armored').value)
            },
            tc: document.getElementById('has-tc').checked,
            cupboards: 1
        };

        this.bases.push(base);
        this.saveBases();
        this.updateBaseSelect();
        document.getElementById('base-modal').classList.add('hidden');
        this.tablet.showToast('Base added', 'success');
    }

    updateBaseSelect() {
        const select = document.getElementById('base-select');
        select.innerHTML = '<option value="">Choose a base...</option>' +
            this.bases.map(base => `<option value="${base.id}">${base.name}</option>`).join('');
    }

    loadBase() {
        const id = document.getElementById('base-select').value;
        if (!id) {
            this.tablet.showError('Select a base');
            return;
        }

        this.currentBase = this.bases.find(b => b.id === id);
        if (!this.currentBase) return;

        document.getElementById('sim-base-name').innerText = this.currentBase.name;
        
        const details = document.getElementById('base-details');
        details.innerHTML = `
            <div class="detail-row">Owner: ${this.currentBase.owner}</div>
            <div class="detail-row">Location: (${this.currentBase.location.x}, 0, ${this.currentBase.location.z})</div>
            <div class="detail-row">Walls: ${this.currentBase.walls.stone} stone, ${this.currentBase.walls.metal} metal, ${this.currentBase.walls.armored} armored, ${this.currentBase.walls.hqm} HQM</div>
            <div class="detail-row">Doors: ${this.currentBase.doors.wood} wood, ${this.currentBase.doors.metal} metal, ${this.currentBase.doors.armored} armored</div>
            <div class="detail-row">TC: ${this.currentBase.tc ? 'Yes' : 'No'}</div>
        `;

        this.analyzeWeakness();
    }

    simulateAttack() {
        if (!this.currentBase) {
            this.tablet.showError('Load a base first');
            return;
        }

        const method = document.getElementById('attack-method').value;
        const quantity = parseInt(document.getElementById('attack-quantity').value);

        // Base damage values (simplified)
        const damage = {
            c4: 500,
            rocket: 400,
            satchel: 300,
            pick: 10,
            jackhammer: 25
        };

        // Wall health
        const wallHealth = {
            stone: 500,
            metal: 1000,
            armored: 2000,
            hqm: 3000
        };

        let totalDamage = damage[method] * quantity;
        let remainingHealth = this.calculateTotalHealth();
        let result = totalDamage >= remainingHealth ? 'BREACHED' : 'SECURE';
        let percentage = Math.min(100, Math.round(totalDamage / remainingHealth * 100));

        const resultDiv = document.getElementById('sim-result');
        resultDiv.innerHTML = `
            <h4>SIMULATION RESULT</h4>
            <div class="result-${result.toLowerCase()}">
                <strong>${result}</strong>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
            <div>Damage Dealt: ${totalDamage}</div>
            <div>Base Health: ${remainingHealth}</div>
            <div>${percentage}% of base destroyed</div>
        `;
    }

    calculateTotalHealth() {
        const wallHealth = {
            stone: 500,
            metal: 1000,
            armored: 2000,
            hqm: 3000
        };

        let total = 0;
        total += this.currentBase.walls.stone * wallHealth.stone;
        total += this.currentBase.walls.metal * wallHealth.metal;
        total += this.currentBase.walls.armored * wallHealth.armored;
        total += this.currentBase.walls.hqm * wallHealth.hqm;
        
        // Add door health (simplified)
        total += this.currentBase.doors.wood * 250;
        total += this.currentBase.doors.metal * 500;
        total += this.currentBase.doors.armored * 1000;

        return total;
    }

    analyzeWeakness() {
        const list = document.getElementById('weakness-list');
        
        let html = '<ul>';
        if (this.currentBase.walls.stone > 0) {
            html += '<li>⚠️ Stone walls - upgrade to metal</li>';
        }
        if (this.currentBase.doors.wood > 0) {
            html += '<li>⚠️ Wood doors - easy pick raiding</li>';
        }
        if (this.currentBase.walls.stone > this.currentBase.walls.metal) {
            html += '<li>💡 Consider upgrading stone to metal</li>';
        }
        if (!this.currentBase.tc) {
            html += '<li>❌ No tool cupboard - base can decay!</li>';
        }
        html += '</ul>';

        list.innerHTML = html;
    }

    refresh() {
        this.updateBaseSelect();
        this.tablet.showToast('Base defense refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.baseDefense = new BaseDefense(window.drainedTablet);
});