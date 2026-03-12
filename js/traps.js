// traps.js – DRAINED TABLET ULTIMATE v7.0.0
// Trap controls: shotgun trap, flame turret, SAM site, landmine, bear trap.
// All original features preserved, now with RCON integration and enhanced UI.

class Traps {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.settings = this.loadSettings();
        this.init();
    }

    loadSettings() {
        const saved = localStorage.getItem('tdl_traps_settings');
        return saved ? JSON.parse(saved) : {
            shotgunDamage: 75,
            flameDamage: 20,
            samAccuracy: 80,
            samRange: 100,
            landmineDamage: 150,
            bearTrapDamage: 50,
            bearTrapHoldTime: 30
        };
    }

    saveSettings() {
        localStorage.setItem('tdl_traps_settings', JSON.stringify(this.settings));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'traps') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-traps');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="traps-container">
                <div class="traps-header">
                    <h2>🪤 TRAP CONTROLS</h2>
                </div>

                <div class="traps-grid">
                    <!-- Shotgun Trap -->
                    <div class="trap-section">
                        <h3>🔫 SHOTGUN TRAP</h3>
                        <div class="setting-item">
                            <label>Damage: <span id="shotgun-val">${this.settings.shotgunDamage}</span></label>
                            <input type="range" id="shotgun-damage" min="25" max="200" step="5" value="${this.settings.shotgunDamage}">
                        </div>
                        <div class="button-group">
                            <button id="spawn-shotgun" class="trap-btn">🔫 SPAWN</button>
                            <button id="test-shotgun" class="trap-btn">⚡ TEST</button>
                        </div>
                    </div>

                    <!-- Flame Turret -->
                    <div class="trap-section">
                        <h3>🔥 FLAME TURRET</h3>
                        <div class="setting-item">
                            <label>Damage: <span id="flame-val">${this.settings.flameDamage}</span></label>
                            <input type="range" id="flame-damage" min="5" max="50" step="1" value="${this.settings.flameDamage}">
                        </div>
                        <div class="button-group">
                            <button id="spawn-flame" class="trap-btn">🔥 SPAWN</button>
                            <button id="test-flame" class="trap-btn">⚡ TEST</button>
                        </div>
                    </div>

                    <!-- SAM Site -->
                    <div class="trap-section">
                        <h3>🎯 SAM SITE</h3>
                        <div class="setting-item">
                            <label>Accuracy: <span id="sam-acc-val">${this.settings.samAccuracy}</span>%</label>
                            <input type="range" id="sam-accuracy" min="20" max="100" step="5" value="${this.settings.samAccuracy}">
                        </div>
                        <div class="setting-item">
                            <label>Range: <span id="sam-range-val">${this.settings.samRange}</span>m</label>
                            <input type="range" id="sam-range" min="25" max="200" step="5" value="${this.settings.samRange}">
                        </div>
                        <div class="button-group">
                            <button id="spawn-sam" class="trap-btn">🎯 SPAWN</button>
                            <button id="test-sam" class="trap-btn">⚡ TEST</button>
                        </div>
                    </div>

                    <!-- Landmine -->
                    <div class="trap-section">
                        <h3>💣 LANDMINE</h3>
                        <div class="setting-item">
                            <label>Damage: <span id="landmine-val">${this.settings.landmineDamage}</span></label>
                            <input type="range" id="landmine-damage" min="50" max="300" step="10" value="${this.settings.landmineDamage}">
                        </div>
                        <div class="button-group">
                            <button id="spawn-landmine" class="trap-btn">💣 SPAWN</button>
                            <button id="test-landmine" class="trap-btn">⚡ TEST</button>
                        </div>
                    </div>

                    <!-- Bear Trap -->
                    <div class="trap-section">
                        <h3>🪤 BEAR TRAP</h3>
                        <div class="setting-item">
                            <label>Damage: <span id="beartrap-val">${this.settings.bearTrapDamage}</span></label>
                            <input type="range" id="beartrap-damage" min="10" max="100" step="5" value="${this.settings.bearTrapDamage}">
                        </div>
                        <div class="setting-item">
                            <label>Hold Time: <span id="hold-val">${this.settings.bearTrapHoldTime}</span>s</label>
                            <input type="range" id="hold-time" min="5" max="60" step="5" value="${this.settings.bearTrapHoldTime}">
                        </div>
                        <div class="button-group">
                            <button id="spawn-beartrap" class="trap-btn">🪤 SPAWN</button>
                            <button id="test-beartrap" class="trap-btn">⚡ TEST</button>
                        </div>
                    </div>

                    <!-- Trap Stats -->
                    <div class="trap-section">
                        <h3>📊 TRAP STATS</h3>
                        <div class="stat-row">
                            <span>Active Shotgun Traps:</span>
                            <span id="stat-shotgun">0</span>
                        </div>
                        <div class="stat-row">
                            <span>Active Flame Turrets:</span>
                            <span id="stat-flame">0</span>
                        </div>
                        <div class="stat-row">
                            <span>Active SAM Sites:</span>
                            <span id="stat-sam">0</span>
                        </div>
                        <div class="stat-row">
                            <span>Active Landmines:</span>
                            <span id="stat-landmine">0</span>
                        </div>
                        <div class="stat-row">
                            <span>Active Bear Traps:</span>
                            <span id="stat-beartrap">0</span>
                        </div>
                    </div>
                </div>

                <div class="traps-actions">
                    <button id="save-traps" class="trap-btn primary">💾 SAVE SETTINGS</button>
                    <button id="reset-traps" class="trap-btn">🔄 RESET</button>
                    <button id="remove-all-traps" class="trap-btn warning">🗑️ REMOVE ALL</button>
                </div>

                <div class="quick-spawn">
                    <h3>QUICK SPAWN LOCATION</h3>
                    <div class="coord-inputs">
                        <input type="number" id="trap-x" placeholder="X" value="0">
                        <input type="number" id="trap-y" placeholder="Y" value="0">
                        <input type="number" id="trap-z" placeholder="Z" value="0">
                    </div>
                </div>
            </div>
        `;

        this.setupRangeListeners();
        this.updateStats();
    }

    setupRangeListeners() {
        const ranges = [
            { id: 'shotgun-damage', val: 'shotgun-val' },
            { id: 'flame-damage', val: 'flame-val' },
            { id: 'sam-accuracy', val: 'sam-acc-val' },
            { id: 'sam-range', val: 'sam-range-val' },
            { id: 'landmine-damage', val: 'landmine-val' },
            { id: 'beartrap-damage', val: 'beartrap-val' },
            { id: 'hold-time', val: 'hold-val' }
        ];
        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });
    }

    attachEvents() {
        document.getElementById('spawn-shotgun')?.addEventListener('click', () => this.spawnTrap('shotgun'));
        document.getElementById('spawn-flame')?.addEventListener('click', () => this.spawnTrap('flame'));
        document.getElementById('spawn-sam')?.addEventListener('click', () => this.spawnTrap('sam'));
        document.getElementById('spawn-landmine')?.addEventListener('click', () => this.spawnTrap('landmine'));
        document.getElementById('spawn-beartrap')?.addEventListener('click', () => this.spawnTrap('beartrap'));

        document.getElementById('test-shotgun')?.addEventListener('click', () => this.testTrap('shotgun'));
        document.getElementById('test-flame')?.addEventListener('click', () => this.testTrap('flame'));
        document.getElementById('test-sam')?.addEventListener('click', () => this.testTrap('sam'));
        document.getElementById('test-landmine')?.addEventListener('click', () => this.testTrap('landmine'));
        document.getElementById('test-beartrap')?.addEventListener('click', () => this.testTrap('beartrap'));

        document.getElementById('save-traps')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-traps')?.addEventListener('click', () => this.resetSettings());
        document.getElementById('remove-all-traps')?.addEventListener('click', () => this.removeAll());
    }

    async spawnTrap(type) {
        const x = document.getElementById('trap-x').value;
        const y = document.getElementById('trap-y').value;
        const z = document.getElementById('trap-z').value;
        try {
            await ConnectionManager.executeCommand(`spawn.trap ${type} ${x} ${y} ${z}`);
            this.tablet.showToast(`Spawned ${type} trap at (${x}, ${y}, ${z})`, 'success');
            this.updateStats();
        } catch (err) {
            this.tablet.showError('Spawn failed: ' + err.message);
        }
    }

    testTrap(type) {
        this.tablet.showToast(`Testing ${type} trap...`, 'info');
        setTimeout(() => {
            this.tablet.showToast(`${type} trap triggered!`, 'warning');
        }, 1000);
    }

    async removeAll() {
        if (!confirm('Remove ALL traps?')) return;
        try {
            await ConnectionManager.executeCommand('remove.traps all');
            this.tablet.showToast('All traps removed', 'info');
            this.updateStats();
        } catch (err) {
            this.tablet.showError('Remove failed: ' + err.message);
        }
    }

    async updateStats() {
        try {
            const counts = await ConnectionManager.executeCommand('trap.count');
            if (counts) {
                const parts = counts.split(',');
                parts.forEach(p => {
                    const [type, count] = p.split(':');
                    const el = document.getElementById(`stat-${type}`);
                    if (el) el.innerText = count;
                });
            }
        } catch (err) {
            // fallback – keep existing values
        }
    }

    saveSettings() {
        this.settings = {
            shotgunDamage: parseInt(document.getElementById('shotgun-damage').value),
            flameDamage: parseInt(document.getElementById('flame-damage').value),
            samAccuracy: parseInt(document.getElementById('sam-accuracy').value),
            samRange: parseInt(document.getElementById('sam-range').value),
            landmineDamage: parseInt(document.getElementById('landmine-damage').value),
            bearTrapDamage: parseInt(document.getElementById('beartrap-damage').value),
            bearTrapHoldTime: parseInt(document.getElementById('hold-time').value)
        };
        this.saveSettings();
        this.tablet.showToast('Trap settings saved', 'success');
    }

    resetSettings() {
        if (!confirm('Reset trap settings?')) return;
        this.settings = {
            shotgunDamage: 75,
            flameDamage: 20,
            samAccuracy: 80,
            samRange: 100,
            landmineDamage: 150,
            bearTrapDamage: 50,
            bearTrapHoldTime: 30
        };
        document.getElementById('shotgun-damage').value = this.settings.shotgunDamage;
        document.getElementById('shotgun-val').innerText = this.settings.shotgunDamage;
        document.getElementById('flame-damage').value = this.settings.flameDamage;
        document.getElementById('flame-val').innerText = this.settings.flameDamage;
        document.getElementById('sam-accuracy').value = this.settings.samAccuracy;
        document.getElementById('sam-acc-val').innerText = this.settings.samAccuracy;
        document.getElementById('sam-range').value = this.settings.samRange;
        document.getElementById('sam-range-val').innerText = this.settings.samRange;
        document.getElementById('landmine-damage').value = this.settings.landmineDamage;
        document.getElementById('landmine-val').innerText = this.settings.landmineDamage;
        document.getElementById('beartrap-damage').value = this.settings.bearTrapDamage;
        document.getElementById('beartrap-val').innerText = this.settings.bearTrapDamage;
        document.getElementById('hold-time').value = this.settings.bearTrapHoldTime;
        document.getElementById('hold-val').innerText = this.settings.bearTrapHoldTime;
        this.tablet.showToast('Settings reset', 'info');
    }

    refresh() {
        this.updateStats();
        this.tablet.showToast('Traps manager refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.traps = new Traps();
});