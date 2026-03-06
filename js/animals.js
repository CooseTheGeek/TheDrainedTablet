// ANIMALS MANAGER - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class AnimalsManager {
    constructor(tablet) {
        this.tablet = tablet;
        this.settings = this.loadSettings();
        this.populations = {
            bears: 0,
            wolves: 0,
            boars: 0,
            deer: 0,
            chickens: 0,
            horses: 0
        };
        this.init();
    }

    loadSettings() {
        const saved = localStorage.getItem('drained_animal_settings');
        return saved ? JSON.parse(saved) : {
            bearAggroRange: 50,
            bearDamage: 60,
            wolfPackSize: 3,
            wolfDamage: 30,
            boarAggressive: true,
            boarDamage: 20,
            spawnDensity: 1.0,
            horseTamingTime: 300,
            chickenEggRate: 300
        };
    }

    saveSettings() {
        localStorage.setItem('drained_animal_settings', JSON.stringify(this.settings));
    }

    init() {
        this.createAnimalsHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'animals') {
                this.refresh();
            }
        });
    }

    createAnimalsHTML() {
        const animalsTab = document.getElementById('tab-animals');
        if (!animalsTab) return;

        animalsTab.innerHTML = `
            <div class="animals-container">
                <div class="animals-header">
                    <h2>🐻 ANIMAL CONTROLS</h2>
                </div>

                <div class="animals-grid">
                    <div class="animal-section">
                        <h3>🐻 BEARS</h3>
                        
                        <div class="setting-item">
                            <label>Aggro Range: <span id="bear-aggro-val">${this.settings.bearAggroRange}</span>m</label>
                            <input type="range" id="bear-aggro" min="10" max="200" step="5" value="${this.settings.bearAggroRange}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Damage: <span id="bear-damage-val">${this.settings.bearDamage}</span></label>
                            <input type="range" id="bear-damage" min="10" max="100" step="5" value="${this.settings.bearDamage}">
                        </div>
                        
                        <div class="button-group">
                            <button id="spawn-bear" class="animal-btn">🐻 SPAWN BEAR</button>
                            <button id="remove-bears" class="animal-btn warning">🗑️ REMOVE ALL</button>
                        </div>
                        
                        <div class="stat-row">Population: <span id="bear-pop">0</span></div>
                    </div>

                    <div class="animal-section">
                        <h3>🐺 WOLVES</h3>
                        
                        <div class="setting-item">
                            <label>Pack Size: <span id="wolf-pack-val">${this.settings.wolfPackSize}</span></label>
                            <input type="range" id="wolf-pack" min="1" max="10" value="${this.settings.wolfPackSize}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Damage: <span id="wolf-damage-val">${this.settings.wolfDamage}</span></label>
                            <input type="range" id="wolf-damage" min="10" max="50" step="5" value="${this.settings.wolfDamage}">
                        </div>
                        
                        <div class="button-group">
                            <button id="spawn-wolf" class="animal-btn">🐺 SPAWN WOLF</button>
                            <button id="remove-wolves" class="animal-btn warning">🗑️ REMOVE ALL</button>
                        </div>
                        
                        <div class="stat-row">Population: <span id="wolf-pop">0</span></div>
                    </div>

                    <div class="animal-section">
                        <h3>🐗 BOARS</h3>
                        
                        <div class="setting-item">
                            <label>Damage: <span id="boar-damage-val">${this.settings.boarDamage}</span></label>
                            <input type="range" id="boar-damage" min="5" max="40" step="5" value="${this.settings.boarDamage}">
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="boar-aggressive" ${this.settings.boarAggressive ? 'checked' : ''}>
                                Aggressive
                            </label>
                        </div>
                        
                        <div class="button-group">
                            <button id="spawn-boar" class="animal-btn">🐗 SPAWN BOAR</button>
                            <button id="remove-boars" class="animal-btn warning">🗑️ REMOVE ALL</button>
                        </div>
                        
                        <div class="stat-row">Population: <span id="boar-pop">0</span></div>
                    </div>

                    <div class="animal-section">
                        <h3>🦌 DEER</h3>
                        
                        <div class="button-group">
                            <button id="spawn-deer" class="animal-btn">🦌 SPAWN DEER</button>
                            <button id="remove-deer" class="animal-btn warning">🗑️ REMOVE ALL</button>
                        </div>
                        
                        <div class="stat-row">Population: <span id="deer-pop">0</span></div>
                    </div>

                    <div class="animal-section">
                        <h3>🐔 CHICKENS</h3>
                        
                        <div class="setting-item">
                            <label>Egg Rate: <span id="egg-rate-val">${this.settings.chickenEggRate}</span>s</label>
                            <input type="range" id="egg-rate" min="60" max="600" step="30" value="${this.settings.chickenEggRate}">
                        </div>
                        
                        <div class="button-group">
                            <button id="spawn-chicken" class="animal-btn">🐔 SPAWN CHICKEN</button>
                            <button id="remove-chickens" class="animal-btn warning">🗑️ REMOVE ALL</button>
                        </div>
                        
                        <div class="stat-row">Population: <span id="chicken-pop">0</span></div>
                    </div>

                    <div class="animal-section">
                        <h3>🐎 HORSES</h3>
                        
                        <div class="setting-item">
                            <label>Taming Time: <span id="taming-val">${this.settings.horseTamingTime}</span>s</label>
                            <input type="range" id="taming-time" min="60" max="600" step="10" value="${this.settings.horseTamingTime}">
                        </div>
                        
                        <div class="button-group">
                            <button id="spawn-horse" class="animal-btn">🐎 SPAWN HORSE</button>
                            <button id="remove-horses" class="animal-btn warning">🗑️ REMOVE ALL</button>
                        </div>
                        
                        <div class="stat-row">Population: <span id="horse-pop">0</span></div>
                    </div>
                </div>

                <div class="global-animal-settings">
                    <h3>🌍 GLOBAL SETTINGS</h3>
                    
                    <div class="setting-item">
                        <label>Spawn Density: <span id="density-val">${this.settings.spawnDensity}</span>x</label>
                        <input type="range" id="spawn-density" min="0.1" max="3" step="0.1" value="${this.settings.spawnDensity}">
                    </div>
                    
                    <div class="button-group">
                        <button id="kill-all-animals" class="animal-btn warning">💀 KILL ALL ANIMALS</button>
                        <button id="reset-population" class="animal-btn">🔄 RESET POPULATION</button>
                    </div>
                </div>

                <div class="animal-actions">
                    <button id="save-animals" class="animal-btn primary">💾 SAVE SETTINGS</button>
                    <button id="reset-animals" class="animal-btn">🔄 RESET</button>
                </div>
            </div>
        `;

        this.setupRangeListeners();
        this.updatePopulations();
    }

    setupEventListeners() {
        // Spawn buttons
        document.getElementById('spawn-bear')?.addEventListener('click', () => this.spawnAnimal('bear'));
        document.getElementById('spawn-wolf')?.addEventListener('click', () => this.spawnAnimal('wolf'));
        document.getElementById('spawn-boar')?.addEventListener('click', () => this.spawnAnimal('boar'));
        document.getElementById('spawn-deer')?.addEventListener('click', () => this.spawnAnimal('deer'));
        document.getElementById('spawn-chicken')?.addEventListener('click', () => this.spawnAnimal('chicken'));
        document.getElementById('spawn-horse')?.addEventListener('click', () => this.spawnAnimal('horse'));

        // Remove buttons
        document.getElementById('remove-bears')?.addEventListener('click', () => this.removeAll('bears'));
        document.getElementById('remove-wolves')?.addEventListener('click', () => this.removeAll('wolves'));
        document.getElementById('remove-boars')?.addEventListener('click', () => this.removeAll('boars'));
        document.getElementById('remove-deer')?.addEventListener('click', () => this.removeAll('deer'));
        document.getElementById('remove-chickens')?.addEventListener('click', () => this.removeAll('chickens'));
        document.getElementById('remove-horses')?.addEventListener('click', () => this.removeAll('horses'));

        // Global buttons
        document.getElementById('kill-all-animals')?.addEventListener('click', () => this.killAll());
        document.getElementById('reset-population')?.addEventListener('click', () => this.resetPopulation());

        // Save/Reset
        document.getElementById('save-animals')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-animals')?.addEventListener('click', () => this.resetSettings());
    }

    setupRangeListeners() {
        const ranges = [
            { id: 'bear-aggro', val: 'bear-aggro-val' },
            { id: 'bear-damage', val: 'bear-damage-val' },
            { id: 'wolf-pack', val: 'wolf-pack-val' },
            { id: 'wolf-damage', val: 'wolf-damage-val' },
            { id: 'boar-damage', val: 'boar-damage-val' },
            { id: 'egg-rate', val: 'egg-rate-val' },
            { id: 'taming-time', val: 'taming-val' },
            { id: 'spawn-density', val: 'density-val' }
        ];

        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });
    }

    spawnAnimal(type) {
        this.populations[type + 's']++;
        this.updatePopulations();
        this.tablet.sendCommand(`spawn.animal ${type}`).then(() => {
            this.tablet.showToast(`Spawned a ${type}`, 'success');
        }).catch(err => {
            this.tablet.showError('Spawn failed: ' + err.message);
        });
    }

    removeAll(type) {
        this.tablet.showConfirm(`Remove all ${type}?`, (confirmed) => {
            if (confirmed) {
                this.populations[type] = 0;
                this.updatePopulations();
                this.tablet.sendCommand(`kill.animals ${type}`).then(() => {
                    this.tablet.showToast(`All ${type} removed`, 'info');
                }).catch(err => {
                    this.tablet.showError('Remove failed: ' + err.message);
                });
            }
        });
    }

    killAll() {
        this.tablet.showConfirm('KILL ALL ANIMALS?', (confirmed) => {
            if (confirmed) {
                Object.keys(this.populations).forEach(key => this.populations[key] = 0);
                this.updatePopulations();
                this.tablet.sendCommand('kill.animals all').then(() => {
                    this.tablet.showToast('All animals killed', 'error');
                }).catch(err => {
                    this.tablet.showError('Kill failed: ' + err.message);
                });
            }
        });
    }

    resetPopulation() {
        this.tablet.showConfirm('Reset animal populations to default?', (confirmed) => {
            if (confirmed) {
                this.tablet.sendCommand('reset.animal.population').then(() => {
                    this.tablet.showToast('Population reset', 'success');
                }).catch(err => {
                    this.tablet.showError('Reset failed: ' + err.message);
                });
            }
        });
    }

    updatePopulations() {
        document.getElementById('bear-pop').innerText = this.populations.bears;
        document.getElementById('wolf-pop').innerText = this.populations.wolves;
        document.getElementById('boar-pop').innerText = this.populations.boars;
        document.getElementById('deer-pop').innerText = this.populations.deer;
        document.getElementById('chicken-pop').innerText = this.populations.chickens;
        document.getElementById('horse-pop').innerText = this.populations.horses;
    }

    saveSettings() {
        this.settings = {
            bearAggroRange: parseInt(document.getElementById('bear-aggro').value),
            bearDamage: parseInt(document.getElementById('bear-damage').value),
            wolfPackSize: parseInt(document.getElementById('wolf-pack').value),
            wolfDamage: parseInt(document.getElementById('wolf-damage').value),
            boarAggressive: document.getElementById('boar-aggressive').checked,
            boarDamage: parseInt(document.getElementById('boar-damage').value),
            spawnDensity: parseFloat(document.getElementById('spawn-density').value),
            horseTamingTime: parseInt(document.getElementById('taming-time').value),
            chickenEggRate: parseInt(document.getElementById('egg-rate').value)
        };

        this.saveSettings();
        this.tablet.showToast('Animal settings saved', 'success');
    }

    resetSettings() {
        this.tablet.showConfirm('Reset animal settings?', (confirmed) => {
            if (confirmed) {
                this.settings = {
                    bearAggroRange: 50,
                    bearDamage: 60,
                    wolfPackSize: 3,
                    wolfDamage: 30,
                    boarAggressive: true,
                    boarDamage: 20,
                    spawnDensity: 1.0,
                    horseTamingTime: 300,
                    chickenEggRate: 300
                };

                // Update UI
                document.getElementById('bear-aggro').value = this.settings.bearAggroRange;
                document.getElementById('bear-aggro-val').innerText = this.settings.bearAggroRange;
                document.getElementById('bear-damage').value = this.settings.bearDamage;
                document.getElementById('bear-damage-val').innerText = this.settings.bearDamage;
                document.getElementById('wolf-pack').value = this.settings.wolfPackSize;
                document.getElementById('wolf-pack-val').innerText = this.settings.wolfPackSize;
                document.getElementById('wolf-damage').value = this.settings.wolfDamage;
                document.getElementById('wolf-damage-val').innerText = this.settings.wolfDamage;
                document.getElementById('boar-aggressive').checked = this.settings.boarAggressive;
                document.getElementById('boar-damage').value = this.settings.boarDamage;
                document.getElementById('boar-damage-val').innerText = this.settings.boarDamage;
                document.getElementById('spawn-density').value = this.settings.spawnDensity;
                document.getElementById('density-val').innerText = this.settings.spawnDensity;
                document.getElementById('taming-time').value = this.settings.horseTamingTime;
                document.getElementById('taming-val').innerText = this.settings.horseTamingTime;
                document.getElementById('egg-rate').value = this.settings.chickenEggRate;
                document.getElementById('egg-rate-val').innerText = this.settings.chickenEggRate;

                this.tablet.showToast('Settings reset', 'info');
            }
        });
    }

    refresh() {
        this.updatePopulations();
        this.tablet.showToast('Animal controls refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.animalsManager = new AnimalsManager(window.drainedTablet);
});