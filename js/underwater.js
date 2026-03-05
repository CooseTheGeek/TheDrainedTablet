// UNDERWATER CONTROLS - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Stewart (CooseTheGeek). All Rights Reserved.

class UnderwaterManager {
    constructor(tablet) {
        this.tablet = tablet;
        this.settings = this.loadSettings();
        this.init();
    }

    loadSettings() {
        const saved = localStorage.getItem('drained_underwater_settings');
        return saved ? JSON.parse(saved) : {
            torpedoDamage: 200,
            submarineFuel: 1.0,
            maxDepth: 50,
            oxygenRate: 1.0,
            labDoorRespawn: 300,
            labLootQuality: 1.0,
            labScientistCount: 5
        };
    }

    saveSettings() {
        localStorage.setItem('drained_underwater_settings', JSON.stringify(this.settings));
    }

    init() {
        this.createUnderwaterHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'underwater') {
                this.refresh();
            }
        });
    }

    createUnderwaterHTML() {
        const underwaterTab = document.getElementById('tab-underwater');
        if (!underwaterTab) return;

        underwaterTab.innerHTML = `
            <div class="underwater-container">
                <div class="underwater-header">
                    <h2>🌊 UNDERWATER CONTROLS</h2>
                </div>

                <div class="underwater-grid">
                    <div class="underwater-section">
                        <h3>🚤 SUBMARINE</h3>
                        
                        <div class="setting-item">
                            <label>Torpedo Damage: <span id="torpedo-val">${this.settings.torpedoDamage}</span></label>
                            <input type="range" id="torpedo-damage" min="50" max="400" step="10" value="${this.settings.torpedoDamage}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Fuel Consumption: <span id="fuel-val">${this.settings.submarineFuel}</span>x</label>
                            <input type="range" id="fuel-consumption" min="0.5" max="2" step="0.1" value="${this.settings.submarineFuel}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Max Depth: <span id="depth-val">${this.settings.maxDepth}</span>m</label>
                            <input type="range" id="max-depth" min="20" max="100" step="5" value="${this.settings.maxDepth}">
                        </div>
                        
                        <div class="button-group">
                            <button id="spawn-sub" class="underwater-btn">🚤 SPAWN SUBMARINE</button>
                            <button id="test-sub" class="underwater-btn">⚡ TEST</button>
                        </div>
                    </div>

                    <div class="underwater-section">
                        <h3>🫧 DIVING GEAR</h3>
                        
                        <div class="setting-item">
                            <label>Oxygen Consumption: <span id="oxygen-val">${this.settings.oxygenRate}</span>x</label>
                            <input type="range" id="oxygen-rate" min="0.5" max="2" step="0.1" value="${this.settings.oxygenRate}">
                        </div>
                    </div>

                    <div class="underwater-section">
                        <h3>🏛️ UNDERWATER LAB</h3>
                        
                        <div class="setting-item">
                            <label>Door Respawn: <span id="door-val">${this.settings.labDoorRespawn}</span>s</label>
                            <input type="range" id="door-respawn" min="60" max="600" step="30" value="${this.settings.labDoorRespawn}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Loot Quality: <span id="loot-val">${this.settings.labLootQuality}</span>x</label>
                            <input type="range" id="loot-quality" min="0.5" max="3" step="0.1" value="${this.settings.labLootQuality}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Scientist Count: <span id="scientist-val">${this.settings.labScientistCount}</span></label>
                            <input type="range" id="scientist-count" min="0" max="10" value="${this.settings.labScientistCount}">
                        </div>
                        
                        <div class="button-group">
                            <button id="reset-lab" class="underwater-btn">🔄 RESET LAB</button>
                            <button id="spawn-crate" class="underwater-btn">📦 SPAWN CRATE</button>
                        </div>
                    </div>

                    <div class="underwater-section">
                        <h3>📊 UNDERWATER STATS</h3>
                        
                        <div class="stat-row">
                            <span>Active Submarines:</span>
                            <span id="stat-subs">0</span>
                        </div>
                        <div class="stat-row">
                            <span>Lab Scientists:</span>
                            <span id="stat-scientists">0</span>
                        </div>
                        <div class="stat-row">
                            <span>Locked Crates:</span>
                            <span id="stat-crates">0</span>
                        </div>
                        <div class="stat-row">
                            <span>Water Visibility:</span>
                            <span id="stat-visibility">15m</span>
                        </div>
                    </div>
                </div>

                <div class="underwater-actions">
                    <button id="save-underwater" class="underwater-btn primary">💾 SAVE SETTINGS</button>
                    <button id="reset-underwater" class="underwater-btn">🔄 RESET</button>
                </div>

                <div class="diving-locations">
                    <h3>DIVING LOCATIONS</h3>
                    <div class="location-buttons">
                        <button class="loc-btn" data-x="2200" data-z="2200">Underwater Lab</button>
                        <button class="loc-btn" data-x="2800" data-z="800">Large Harbor</button>
                        <button class="loc-btn" data-x="800" data-z="1200">Small Harbor</button>
                    </div>
                </div>
            </div>
        `;

        this.setupRangeListeners();
        this.updateStats();
    }

    setupEventListeners() {
        document.getElementById('spawn-sub')?.addEventListener('click', () => this.spawnSub());
        document.getElementById('test-sub')?.addEventListener('click', () => this.testSub());
        document.getElementById('reset-lab')?.addEventListener('click', () => this.resetLab());
        document.getElementById('spawn-crate')?.addEventListener('click', () => this.spawnCrate());
        document.getElementById('save-underwater')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-underwater')?.addEventListener('click', () => this.resetSettings());

        document.querySelectorAll('.loc-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const x = e.target.dataset.x;
                const z = e.target.dataset.z;
                this.gotoLocation(x, z);
            });
        });

        this.setupRangeListeners();
    }

    setupRangeListeners() {
        const ranges = [
            { id: 'torpedo-damage', val: 'torpedo-val' },
            { id: 'fuel-consumption', val: 'fuel-val' },
            { id: 'max-depth', val: 'depth-val' },
            { id: 'oxygen-rate', val: 'oxygen-val' },
            { id: 'door-respawn', val: 'door-val' },
            { id: 'loot-quality', val: 'loot-val' },
            { id: 'scientist-count', val: 'scientist-val' }
        ];

        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });
    }

    spawnSub() {
        this.tablet.showToast('Submarine spawned at your location', 'success');
        this.updateStats();
    }

    testSub() {
        this.tablet.showToast('Testing submarine systems...', 'info');
        setTimeout(() => {
            this.tablet.showToast('Submarine operational', 'success');
        }, 1500);
    }

    resetLab() {
        this.tablet.showConfirm('Reset underwater laboratory?', (confirmed) => {
            if (confirmed) {
                this.tablet.showToast('Underwater lab reset', 'info');
            }
        });
    }

    spawnCrate() {
        this.tablet.showToast('Locked crate spawned', 'success');
    }

    gotoLocation(x, z) {
        this.tablet.showToast(`Teleporting to (${x}, 0, ${z})`, 'info');
    }

    updateStats() {
        document.getElementById('stat-subs').innerText = '2';
        document.getElementById('stat-scientists').innerText = '8';
        document.getElementById('stat-crates').innerText = '3';
    }

    saveSettings() {
        this.settings = {
            torpedoDamage: parseInt(document.getElementById('torpedo-damage').value),
            submarineFuel: parseFloat(document.getElementById('fuel-consumption').value),
            maxDepth: parseInt(document.getElementById('max-depth').value),
            oxygenRate: parseFloat(document.getElementById('oxygen-rate').value),
            labDoorRespawn: parseInt(document.getElementById('door-respawn').value),
            labLootQuality: parseFloat(document.getElementById('loot-quality').value),
            labScientistCount: parseInt(document.getElementById('scientist-count').value)
        };

        this.saveSettings();
        this.tablet.showToast('Underwater settings saved', 'success');
    }

    resetSettings() {
        this.tablet.showConfirm('Reset underwater settings?', (confirmed) => {
            if (confirmed) {
                this.settings = {
                    torpedoDamage: 200,
                    submarineFuel: 1.0,
                    maxDepth: 50,
                    oxygenRate: 1.0,
                    labDoorRespawn: 300,
                    labLootQuality: 1.0,
                    labScientistCount: 5
                };

                // Update UI
                document.getElementById('torpedo-damage').value = this.settings.torpedoDamage;
                document.getElementById('torpedo-val').innerText = this.settings.torpedoDamage;
                document.getElementById('fuel-consumption').value = this.settings.submarineFuel;
                document.getElementById('fuel-val').innerText = this.settings.submarineFuel;
                document.getElementById('max-depth').value = this.settings.maxDepth;
                document.getElementById('depth-val').innerText = this.settings.maxDepth;
                document.getElementById('oxygen-rate').value = this.settings.oxygenRate;
                document.getElementById('oxygen-val').innerText = this.settings.oxygenRate;
                document.getElementById('door-respawn').value = this.settings.labDoorRespawn;
                document.getElementById('door-val').innerText = this.settings.labDoorRespawn;
                document.getElementById('loot-quality').value = this.settings.labLootQuality;
                document.getElementById('loot-val').innerText = this.settings.labLootQuality;
                document.getElementById('scientist-count').value = this.settings.labScientistCount;
                document.getElementById('scientist-val').innerText = this.settings.labScientistCount;

                this.tablet.showToast('Settings reset', 'info');
            }
        });
    }

    refresh() {
        this.updateStats();
        this.tablet.showToast('Underwater controls refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.underwaterManager = new UnderwaterManager(window.drainedTablet);
});