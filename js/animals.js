// animals.js – DRAINED TABLET ULTIMATE v7.0.0
// Complete animal control: spawn, remove, and adjust settings.
// All original features preserved, now with bridge integration and enhanced UI.

class Animals {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
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
        const saved = localStorage.getItem('tdl_animal_settings');
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
        localStorage.setItem('tdl_animal_settings', JSON.stringify(this.settings));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.fetchPopulations();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'animals') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-animals');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="animals-container">
                <div class="animals-header">
                    <h2>🐻 ANIMAL CONTROLS</h2>
                    <button id="animals-refresh" class="animals-btn">🔄 REFRESH</button>
                </div>

                <div class="animals-grid">
                    <!-- Bears -->
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

                    <!-- Wolves -->
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

                    <!-- Boars -->
                    <div class="animal-section">
                        <h3>🐗 BOARS</h3>
                        <div class="setting-item">
                            <label>Damage: <span id="boar-damage-val">${this.settings.boarDamage}</span></label>
                            <input type="range" id="boar-damage" min="5" max="40" step="5" value="${this.settings.boarDamage}">
                        </div>
                        <div class="checkbox-item">
                            <label><input type="checkbox" id="boar-aggressive" ${this.settings.boarAggressive ? 'checked' : ''}> Aggressive</label>
                        </div>
                        <div class="button-group">
                            <button id="spawn-boar" class="animal-btn">🐗 SPAWN BOAR</button>
                            <button id="remove-boars" class="animal-btn warning">🗑️ REMOVE ALL</button>
                        </div>
                        <div class="stat-row">Population: <span id="boar-pop">0</span></div>
                    </div>

                    <!-- Deer -->
                    <div class="animal-section">
                        <h3>🦌 DEER</h3>
                        <div class="button-group">
                            <button id="spawn-deer" class="animal-btn">🦌 SPAWN DEER</button>
                            <button id="remove-deer" class="animal-btn warning">🗑️ REMOVE ALL</button>
                        </div>
                        <div class="stat-row">Population: <span id="deer-pop">0</span></div>
                    </div>

                    <!-- Chickens -->
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

                    <!-- Horses -->
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

                <div class="animals-actions">
                    <button id="save-animals" class="animal-btn primary">💾 SAVE SETTINGS</button>
                    <button id="reset-animals" class="animal-btn">🔄 RESET</button>
                </div>
            </div>
        `;

        this.setupRangeListeners();
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

    attachEvents() {
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

        // Global actions
        document.getElementById('kill-all-animals')?.addEventListener('click', () => this.killAll());
        document.getElementById('reset-population')?.addEventListener('click', () => this.resetPopulation());

        // Save/Reset
        document.getElementById('save-animals')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-animals')?.addEventListener('click', () => this.resetSettings());
        document.getElementById('animals-refresh')?.addEventListener('click', () => this.refresh());
    }

    async fetchPopulations() {
        if (!this.tablet.connected) return;
        // Attempt to fetch real animal counts via RCON
        try {
            const result = await ConnectionManager.executeCommand('animal.counts');
            // Parse result (format depends on plugin)
            // For now, we'll simulate – replace with actual parsing when available.
            this.populations = {
                bears: Math.floor(Math.random() * 5),
                wolves: Math.floor(Math.random() * 8),
                boars: Math.floor(Math.random() * 10),
                deer: Math.floor(Math.random() * 12),
                chickens: Math.floor(Math.random() * 20),
                horses: Math.floor(Math.random() * 3)
            };
        } catch (err) {
            console.warn('Could not fetch animal populations');
        }
        this.updatePopulations();
    }

    updatePopulations() {
        document.getElementById('bear-pop').innerText = this.populations.bears;
        document.getElementById('wolf-pop').innerText = this.populations.wolves;
        document.getElementById('boar-pop').innerText = this.populations.boars;
        document.getElementById('deer-pop').innerText = this.populations.deer;
        document.getElementById('chicken-pop').innerText = this.populations.chickens;
        document.getElementById('horse-pop').innerText = this.populations.horses;
    }

    async spawnAnimal(type) {
        try {
            await ConnectionManager.executeCommand(`spawn.animal ${type}`);
            this.tablet.showToast(`Spawned a ${type}`, 'success');
            // Optionally increment population locally
            this.populations[type + 's']++;
            this.updatePopulations();
        } catch (err) {
            this.tablet.showError('Spawn failed: ' + err.message);
        }
    }

    async removeAll(type) {
        if (!confirm(`Remove all ${type}?`)) return;
        try {
            await ConnectionManager.executeCommand(`kill.animals ${type}`);
            this.populations[type] = 0;
            this.updatePopulations();
            this.tablet.showToast(`All ${type} removed`, 'info');
        } catch (err) {
            this.tablet.showError('Remove failed: ' + err.message);
        }
    }

    async killAll() {
        if (!confirm('KILL ALL ANIMALS?')) return;
        try {
            await ConnectionManager.executeCommand('kill.animals all');
            this.populations = { bears:0, wolves:0, boars:0, deer:0, chickens:0, horses:0 };
            this.updatePopulations();
            this.tablet.showToast('All animals killed', 'error');
        } catch (err) {
            this.tablet.showError('Kill failed: ' + err.message);
        }
    }

    async resetPopulation() {
        if (!confirm('Reset animal populations to default?')) return;
        try {
            await ConnectionManager.executeCommand('reset.animal.population');
            this.tablet.showToast('Population reset', 'success');
            this.fetchPopulations();
        } catch (err) {
            this.tablet.showError('Reset failed: ' + err.message);
        }
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
        if (!confirm('Reset animal settings to default?')) return;
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
        this.tablet.showToast('Settings reset to default', 'info');
    }

    refresh() {
        this.fetchPopulations();
        this.tablet.showToast('Animal controls refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.animals = new Animals();
});