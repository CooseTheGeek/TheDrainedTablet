// HELICOPTER CONTROLS - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class HeliControls {
    constructor(tablet) {
        this.tablet = tablet;
        this.settings = this.loadSettings();
        this.active = {
            patrolHeli: false,
            chinook: false,
            scrapHeli: false
        };
        this.init();
    }

    loadSettings() {
        const saved = localStorage.getItem('drained_heli_settings');
        return saved ? JSON.parse(saved) : {
            bulletAccuracy: 50,
            bulletDamageScale: 1.0,
            aggroRange: 100,
            escapeRange: 300,
            rocketDamage: 75,
            chinookDropAltitude: 100,
            chinookCrateDespawn: 30,
            chinookGuardCount: 4,
            scrapHeliPopulation: 1,
            minicopterPopulation: 2
        };
    }

    saveSettings() {
        localStorage.setItem('drained_heli_settings', JSON.stringify(this.settings));
    }

    init() {
        this.createHeliHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'heli') {
                this.refresh();
            }
        });
    }

    createHeliHTML() {
        const heliTab = document.getElementById('tab-heli');
        if (!heliTab) return;

        heliTab.innerHTML = `
            <div class="heli-container">
                <div class="heli-header">
                    <h2>🚁 HELICOPTER CONTROLS</h2>
                </div>

                <div class="heli-grid">
                    <div class="heli-section">
                        <h3>🚁 PATROL HELICOPTER</h3>
                        
                        <div class="status-indicator" id="heli-status">
                            Status: <span id="patrol-status">${this.active.patrolHeli ? '🟢 ACTIVE' : '⚫ INACTIVE'}</span>
                        </div>
                        
                        <div class="setting-item">
                            <label>Bullet Accuracy: <span id="accuracy-val">${this.settings.bulletAccuracy}</span>%</label>
                            <input type="range" id="bullet-accuracy" min="10" max="100" value="${this.settings.bulletAccuracy}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Damage Scale: <span id="damage-val">${this.settings.bulletDamageScale}</span>x</label>
                            <input type="range" id="damage-scale" min="0.1" max="3" step="0.1" value="${this.settings.bulletDamageScale}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Aggro Range: <span id="aggro-val">${this.settings.aggroRange}</span>m</label>
                            <input type="range" id="aggro-range" min="50" max="500" step="10" value="${this.settings.aggroRange}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Escape Range: <span id="escape-val">${this.settings.escapeRange}</span>m</label>
                            <input type="range" id="escape-range" min="100" max="1000" step="10" value="${this.settings.escapeRange}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Rocket Damage: <span id="rocket-val">${this.settings.rocketDamage}</span></label>
                            <input type="range" id="rocket-damage" min="25" max="200" step="5" value="${this.settings.rocketDamage}">
                        </div>
                        
                        <div class="button-group">
                            <button id="spawn-heli" class="heli-btn">🚁 SPAWN PATROL</button>
                            <button id="despawn-heli" class="heli-btn warning">🛑 DESPAWN</button>
                        </div>
                    </div>

                    <div class="heli-section">
                        <h3>🚁 CHINOOK</h3>
                        
                        <div class="status-indicator" id="chinook-status">
                            Status: <span id="chinook-active">${this.active.chinook ? '🟢 ACTIVE' : '⚫ INACTIVE'}</span>
                        </div>
                        
                        <div class="setting-item">
                            <label>Drop Altitude: <span id="altitude-val">${this.settings.chinookDropAltitude}</span>m</label>
                            <input type="range" id="drop-altitude" min="50" max="300" step="10" value="${this.settings.chinookDropAltitude}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Crate Despawn: <span id="despawn-val">${this.settings.chinookCrateDespawn}</span>min</label>
                            <input type="range" id="crate-despawn" min="5" max="120" step="5" value="${this.settings.chinookCrateDespawn}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Guard Count: <span id="guard-val">${this.settings.chinookGuardCount}</span></label>
                            <input type="range" id="guard-count" min="0" max="10" value="${this.settings.chinookGuardCount}">
                        </div>
                        
                        <div class="button-group">
                            <button id="spawn-chinook" class="heli-btn">🚁 SPAWN CHINOOK</button>
                            <button id="force-drop" class="heli-btn">📦 FORCE DROP</button>
                            <button id="despawn-chinook" class="heli-btn warning">🛑 DESPAWN</button>
                        </div>
                    </div>

                    <div class="heli-section">
                        <h3>🚁 SCRAP HELICOPTER</h3>
                        
                        <div class="setting-item">
                            <label>Spawn Population: <span id="scrap-pop-val">${this.settings.scrapHeliPopulation}</span></label>
                            <input type="range" id="scrap-pop" min="0" max="5" step="1" value="${this.settings.scrapHeliPopulation}">
                        </div>
                        
                        <div class="button-group">
                            <button id="spawn-scrap" class="heli-btn">🚁 SPAWN SCRAP HELI</button>
                        </div>
                    </div>

                    <div class="heli-section">
                        <h3>🚁 MINICOPTER</h3>
                        
                        <div class="setting-item">
                            <label>Spawn Population: <span id="mini-pop-val">${this.settings.minicopterPopulation}</span></label>
                            <input type="range" id="mini-pop" min="0" max="10" step="1" value="${this.settings.minicopterPopulation}">
                        </div>
                        
                        <div class="button-group">
                            <button id="spawn-mini" class="heli-btn">🚁 SPAWN MINICOPTER</button>
                        </div>
                    </div>
                </div>

                <div class="heli-actions">
                    <button id="save-heli" class="heli-btn primary">💾 SAVE SETTINGS</button>
                    <button id="reset-heli" class="heli-btn">🔄 RESET</button>
                </div>

                <div class="quick-locations">
                    <h3>QUICK SPAWN LOCATIONS</h3>
                    <div class="location-buttons">
                        <button class="loc-btn" data-x="1245" data-z="678">Dome</button>
                        <button class="loc-btn" data-x="500" data-z="2000">Airfield</button>
                        <button class="loc-btn" data-x="3000" data-z="2800">Launch</button>
                        <button class="loc-btn" data-x="3400" data-z="3400">Oil Rig</button>
                        <button class="loc-btn" data-x="100" data-z="100">Small Oil</button>
                    </div>
                </div>
            </div>
        `;

        this.setupRangeListeners();
    }

    setupEventListeners() {
        // Patrol Heli
        document.getElementById('spawn-heli')?.addEventListener('click', () => this.spawnPatrol());
        document.getElementById('despawn-heli')?.addEventListener('click', () => this.despawnPatrol());

        // Chinook
        document.getElementById('spawn-chinook')?.addEventListener('click', () => this.spawnChinook());
        document.getElementById('force-drop')?.addEventListener('click', () => this.forceDrop());
        document.getElementById('despawn-chinook')?.addEventListener('click', () => this.despawnChinook());

        // Scrap Heli
        document.getElementById('spawn-scrap')?.addEventListener('click', () => this.spawnScrapHeli());

        // Minicopter
        document.getElementById('spawn-mini')?.addEventListener('click', () => this.spawnMini());

        // Save/Reset
        document.getElementById('save-heli')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-heli')?.addEventListener('click', () => this.resetSettings());

        // Location presets
        document.querySelectorAll('.loc-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const x = e.target.dataset.x;
                const z = e.target.dataset.z;
                this.spawnAtLocation(x, z);
            });
        });
    }

    setupRangeListeners() {
        const ranges = [
            { id: 'bullet-accuracy', val: 'accuracy-val' },
            { id: 'damage-scale', val: 'damage-val' },
            { id: 'aggro-range', val: 'aggro-val' },
            { id: 'escape-range', val: 'escape-val' },
            { id: 'rocket-damage', val: 'rocket-val' },
            { id: 'drop-altitude', val: 'altitude-val' },
            { id: 'crate-despawn', val: 'despawn-val' },
            { id: 'guard-count', val: 'guard-val' },
            { id: 'scrap-pop', val: 'scrap-pop-val' },
            { id: 'mini-pop', val: 'mini-pop-val' }
        ];

        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });
    }

    spawnPatrol() {
        this.active.patrolHeli = true;
        document.getElementById('patrol-status').innerText = '🟢 ACTIVE';
        this.tablet.sendCommand('spawn.heli').then(() => {
            this.tablet.showToast('Patrol helicopter spawned', 'success');
        }).catch(err => {
            this.tablet.showError('Spawn failed: ' + err.message);
        });
    }

    despawnPatrol() {
        this.active.patrolHeli = false;
        document.getElementById('patrol-status').innerText = '⚫ INACTIVE';
        this.tablet.sendCommand('despawn.heli').then(() => {
            this.tablet.showToast('Patrol helicopter despawned', 'info');
        }).catch(err => {
            this.tablet.showError('Despawn failed: ' + err.message);
        });
    }

    spawnChinook() {
        this.active.chinook = true;
        document.getElementById('chinook-active').innerText = '🟢 ACTIVE';
        this.tablet.sendCommand('spawn.chinook').then(() => {
            this.tablet.showToast('Chinook spawned', 'success');
        }).catch(err => {
            this.tablet.showError('Spawn failed: ' + err.message);
        });
    }

    despawnChinook() {
        this.active.chinook = false;
        document.getElementById('chinook-active').innerText = '⚫ INACTIVE';
        this.tablet.sendCommand('despawn.chinook').then(() => {
            this.tablet.showToast('Chinook despawned', 'info');
        }).catch(err => {
            this.tablet.showError('Despawn failed: ' + err.message);
        });
    }

    forceDrop() {
        this.tablet.sendCommand('chinook.forcedrop').then(() => {
            this.tablet.showToast('Forcing crate drop', 'success');
        }).catch(err => {
            this.tablet.showError('Drop failed: ' + err.message);
        });
    }

    spawnScrapHeli() {
        this.tablet.sendCommand('spawn.scrapheli').then(() => {
            this.tablet.showToast('Scrap helicopter spawned', 'success');
        }).catch(err => {
            this.tablet.showError('Spawn failed: ' + err.message);
        });
    }

    spawnMini() {
        this.tablet.sendCommand('spawn.minicopter').then(() => {
            this.tablet.showToast('Minicopter spawned', 'success');
        }).catch(err => {
            this.tablet.showError('Spawn failed: ' + err.message);
        });
    }

    spawnAtLocation(x, z) {
        this.tablet.showToast(`Spawning at (${x}, 0, ${z})`, 'info');
    }

    saveSettings() {
        this.settings = {
            bulletAccuracy: parseInt(document.getElementById('bullet-accuracy').value),
            bulletDamageScale: parseFloat(document.getElementById('damage-scale').value),
            aggroRange: parseInt(document.getElementById('aggro-range').value),
            escapeRange: parseInt(document.getElementById('escape-range').value),
            rocketDamage: parseInt(document.getElementById('rocket-damage').value),
            chinookDropAltitude: parseInt(document.getElementById('drop-altitude').value),
            chinookCrateDespawn: parseInt(document.getElementById('crate-despawn').value),
            chinookGuardCount: parseInt(document.getElementById('guard-count').value),
            scrapHeliPopulation: parseInt(document.getElementById('scrap-pop').value),
            minicopterPopulation: parseInt(document.getElementById('mini-pop').value)
        };

        this.saveSettings();
        this.tablet.showToast('Helicopter settings saved', 'success');
    }

    resetSettings() {
        this.tablet.showConfirm('Reset helicopter settings?', (confirmed) => {
            if (confirmed) {
                this.settings = {
                    bulletAccuracy: 50,
                    bulletDamageScale: 1.0,
                    aggroRange: 100,
                    escapeRange: 300,
                    rocketDamage: 75,
                    chinookDropAltitude: 100,
                    chinookCrateDespawn: 30,
                    chinookGuardCount: 4,
                    scrapHeliPopulation: 1,
                    minicopterPopulation: 2
                };

                // Update UI
                document.getElementById('bullet-accuracy').value = this.settings.bulletAccuracy;
                document.getElementById('accuracy-val').innerText = this.settings.bulletAccuracy;
                document.getElementById('damage-scale').value = this.settings.bulletDamageScale;
                document.getElementById('damage-val').innerText = this.settings.bulletDamageScale;
                document.getElementById('aggro-range').value = this.settings.aggroRange;
                document.getElementById('aggro-val').innerText = this.settings.aggroRange;
                document.getElementById('escape-range').value = this.settings.escapeRange;
                document.getElementById('escape-val').innerText = this.settings.escapeRange;
                document.getElementById('rocket-damage').value = this.settings.rocketDamage;
                document.getElementById('rocket-val').innerText = this.settings.rocketDamage;
                document.getElementById('drop-altitude').value = this.settings.chinookDropAltitude;
                document.getElementById('altitude-val').innerText = this.settings.chinookDropAltitude;
                document.getElementById('crate-despawn').value = this.settings.chinookCrateDespawn;
                document.getElementById('despawn-val').innerText = this.settings.chinookCrateDespawn;
                document.getElementById('guard-count').value = this.settings.chinookGuardCount;
                document.getElementById('guard-val').innerText = this.settings.chinookGuardCount;
                document.getElementById('scrap-pop').value = this.settings.scrapHeliPopulation;
                document.getElementById('scrap-pop-val').innerText = this.settings.scrapHeliPopulation;
                document.getElementById('mini-pop').value = this.settings.minicopterPopulation;
                document.getElementById('mini-pop-val').innerText = this.settings.minicopterPopulation;

                this.tablet.showToast('Settings reset to default', 'info');
            }
        });
    }

    refresh() {
        document.getElementById('patrol-status').innerText = this.active.patrolHeli ? '🟢 ACTIVE' : '⚫ INACTIVE';
        document.getElementById('chinook-active').innerText = this.active.chinook ? '🟢 ACTIVE' : '⚫ INACTIVE';
        this.tablet.showToast('Helicopter controls refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.heliControls = new HeliControls(window.drainedTablet);
});