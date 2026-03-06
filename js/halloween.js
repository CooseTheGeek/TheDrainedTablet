// HALLOWEEN EVENT MANAGER - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class HalloweenManager {
    constructor(tablet) {
        this.tablet = tablet;
        this.active = false;
        this.scarecrows = [];
        this.settings = this.loadSettings();
        this.init();
    }

    loadSettings() {
        const saved = localStorage.getItem('drained_halloween_settings');
        return saved ? JSON.parse(saved) : {
            scarecrowHealth: 500,
            scarecrowDamage: 50,
            scarecrowAggroRange: 30,
            scarecrowSpawnRate: 300,
            scarecrowsThrowBeancans: true,
            candyMultiplier: 1.0,
            murdererSpawnRate: 600,
            murdererHealth: 250,
            murdererDamage: 40,
            eventDuration: 7 // days
        };
    }

    saveSettings() {
        localStorage.setItem('drained_halloween_settings', JSON.stringify(this.settings));
    }

    init() {
        this.createHalloweenHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'halloween') {
                this.refresh();
            }
        });
    }

    createHalloweenHTML() {
        const halloweenTab = document.getElementById('tab-halloween');
        if (!halloweenTab) return;

        halloweenTab.innerHTML = `
            <div class="halloween-container">
                <div class="halloween-header">
                    <h2>🎃 HALLOWEEN EVENT</h2>
                    <div class="event-toggle">
                        <label class="switch">
                            <input type="checkbox" id="halloween-toggle" ${this.active ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                        <span>Event Status: <span id="event-status">${this.active ? 'ACTIVE' : 'INACTIVE'}</span></span>
                    </div>
                </div>

                <div class="halloween-grid">
                    <div class="halloween-section">
                        <h3>🎃 SCARECROW SETTINGS</h3>
                        
                        <div class="setting-item">
                            <label>Health: <span id="scarecrow-health-val">${this.settings.scarecrowHealth}</span></label>
                            <input type="range" id="scarecrow-health" min="100" max="1000" step="50" value="${this.settings.scarecrowHealth}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Damage: <span id="scarecrow-damage-val">${this.settings.scarecrowDamage}</span></label>
                            <input type="range" id="scarecrow-damage" min="10" max="200" step="5" value="${this.settings.scarecrowDamage}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Aggro Range: <span id="scarecrow-range-val">${this.settings.scarecrowAggroRange}</span>m</label>
                            <input type="range" id="scarecrow-range" min="10" max="100" step="5" value="${this.settings.scarecrowAggroRange}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Spawn Rate: <span id="scarecrow-rate-val">${this.settings.scarecrowSpawnRate}</span>s</label>
                            <input type="range" id="scarecrow-rate" min="60" max="1800" step="30" value="${this.settings.scarecrowSpawnRate}">
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="scarecrow-throw" ${this.settings.scarecrowsThrowBeancans ? 'checked' : ''}>
                                Scarecrows throw beancans
                            </label>
                        </div>
                        
                        <div class="button-group">
                            <button id="spawn-scarecrow" class="halloween-btn">SPAWN SCARECROW</button>
                            <button id="remove-scarecrows" class="halloween-btn warning">REMOVE ALL</button>
                        </div>
                    </div>

                    <div class="halloween-section">
                        <h3>🔪 MURDERER SETTINGS</h3>
                        
                        <div class="setting-item">
                            <label>Health: <span id="murderer-health-val">${this.settings.murdererHealth}</span></label>
                            <input type="range" id="murderer-health" min="100" max="500" step="25" value="${this.settings.murdererHealth}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Damage: <span id="murderer-damage-val">${this.settings.murdererDamage}</span></label>
                            <input type="range" id="murderer-damage" min="10" max="100" step="5" value="${this.settings.murdererDamage}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Spawn Rate: <span id="murderer-rate-val">${this.settings.murdererSpawnRate}</span>s</label>
                            <input type="range" id="murderer-rate" min="120" max="3600" step="60" value="${this.settings.murdererSpawnRate}">
                        </div>
                        
                        <div class="button-group">
                            <button id="spawn-murderer" class="halloween-btn">SPAWN MURDERER</button>
                            <button id="remove-murderers" class="halloween-btn warning">REMOVE ALL</button>
                        </div>
                    </div>

                    <div class="halloween-section">
                        <h3>🍬 REWARD SETTINGS</h3>
                        
                        <div class="setting-item">
                            <label>Candy Multiplier: <span id="candy-mult-val">${this.settings.candyMultiplier}</span>x</label>
                            <input type="range" id="candy-mult" min="0.5" max="5" step="0.5" value="${this.settings.candyMultiplier}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Event Duration: <span id="duration-val">${this.settings.eventDuration}</span> days</label>
                            <input type="range" id="event-duration" min="1" max="30" step="1" value="${this.settings.eventDuration}">
                        </div>
                    </div>

                    <div class="halloween-section">
                        <h3>📊 EVENT STATS</h3>
                        
                        <div class="stat-row">
                            <span>Active Scarecrows:</span>
                            <span id="stat-scarecrows">0</span>
                        </div>
                        <div class="stat-row">
                            <span>Active Murderers:</span>
                            <span id="stat-murderers">0</span>
                        </div>
                        <div class="stat-row">
                            <span>Event Ends:</span>
                            <span id="stat-end">-</span>
                        </div>
                    </div>
                </div>

                <div class="halloween-actions">
                    <button id="save-halloween" class="halloween-btn primary">💾 SAVE SETTINGS</button>
                    <button id="reset-halloween" class="halloween-btn">🔄 RESET</button>
                    <button id="quick-event" class="halloween-btn">⚡ QUICK EVENT</button>
                </div>

                <div class="warning-box">
                    ⚠️ Conflicting events (Halloween/Christmas/Easter) cannot be active simultaneously.
                </div>
            </div>
        `;

        this.updateStats();
        this.setupRangeListeners();
    }

    setupEventListeners() {
        document.getElementById('halloween-toggle')?.addEventListener('change', (e) => {
            this.active = e.target.checked;
            document.getElementById('event-status').innerText = this.active ? 'ACTIVE' : 'INACTIVE';
            this.tablet.showToast(`Halloween event ${this.active ? 'activated' : 'deactivated'}`, this.active ? 'success' : 'info');
        });

        document.getElementById('spawn-scarecrow')?.addEventListener('click', () => this.spawnScarecrow());
        document.getElementById('remove-scarecrows')?.addEventListener('click', () => this.removeAllScarecrows());
        document.getElementById('spawn-murderer')?.addEventListener('click', () => this.spawnMurderer());
        document.getElementById('remove-murderers')?.addEventListener('click', () => this.removeAllMurderers());
        document.getElementById('save-halloween')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-halloween')?.addEventListener('click', () => this.resetSettings());
        document.getElementById('quick-event')?.addEventListener('click', () => this.quickEvent());
    }

    setupRangeListeners() {
        const ranges = [
            { id: 'scarecrow-health', val: 'scarecrow-health-val' },
            { id: 'scarecrow-damage', val: 'scarecrow-damage-val' },
            { id: 'scarecrow-range', val: 'scarecrow-range-val' },
            { id: 'scarecrow-rate', val: 'scarecrow-rate-val' },
            { id: 'murderer-health', val: 'murderer-health-val' },
            { id: 'murderer-damage', val: 'murderer-damage-val' },
            { id: 'murderer-rate', val: 'murderer-rate-val' },
            { id: 'candy-mult', val: 'candy-mult-val' },
            { id: 'event-duration', val: 'duration-val' }
        ];

        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });
    }

    spawnScarecrow() {
        this.tablet.showConfirm('Spawn a scarecrow at your location?', (confirmed) => {
            if (confirmed) {
                this.scarecrows.push({ id: Date.now(), health: this.settings.scarecrowHealth });
                this.updateStats();
                this.tablet.showToast('Scarecrow spawned', 'success');
            }
        });
    }

    removeAllScarecrows() {
        this.tablet.showConfirm('Remove all scarecrows?', (confirmed) => {
            if (confirmed) {
                this.scarecrows = [];
                this.updateStats();
                this.tablet.showToast('All scarecrows removed', 'info');
            }
        });
    }

    spawnMurderer() {
        this.tablet.showConfirm('Spawn a murderer at your location?', (confirmed) => {
            if (confirmed) {
                this.tablet.showToast('Murderer spawned', 'success');
                this.updateStats();
            }
        });
    }

    removeAllMurderers() {
        this.tablet.showConfirm('Remove all murderers?', (confirmed) => {
            if (confirmed) {
                this.tablet.showToast('All murderers removed', 'info');
                this.updateStats();
            }
        });
    }

    updateStats() {
        document.getElementById('stat-scarecrows').innerText = this.scarecrows.length;
        document.getElementById('stat-murderers').innerText = '0'; // Would track actual count
        document.getElementById('stat-end').innerText = new Date(Date.now() + this.settings.eventDuration * 86400000).toLocaleDateString();
    }

    saveSettings() {
        this.settings = {
            scarecrowHealth: parseInt(document.getElementById('scarecrow-health').value),
            scarecrowDamage: parseInt(document.getElementById('scarecrow-damage').value),
            scarecrowAggroRange: parseInt(document.getElementById('scarecrow-range').value),
            scarecrowSpawnRate: parseInt(document.getElementById('scarecrow-rate').value),
            scarecrowsThrowBeancans: document.getElementById('scarecrow-throw').checked,
            candyMultiplier: parseFloat(document.getElementById('candy-mult').value),
            murdererSpawnRate: parseInt(document.getElementById('murderer-rate').value),
            murdererHealth: parseInt(document.getElementById('murderer-health').value),
            murdererDamage: parseInt(document.getElementById('murderer-damage').value),
            eventDuration: parseInt(document.getElementById('event-duration').value)
        };

        this.saveSettings();
        this.tablet.showToast('Halloween settings saved', 'success');
    }

    resetSettings() {
        this.tablet.showConfirm('Reset Halloween settings to default?', (confirmed) => {
            if (confirmed) {
                this.settings = {
                    scarecrowHealth: 500,
                    scarecrowDamage: 50,
                    scarecrowAggroRange: 30,
                    scarecrowSpawnRate: 300,
                    scarecrowsThrowBeancans: true,
                    candyMultiplier: 1.0,
                    murdererSpawnRate: 600,
                    murdererHealth: 250,
                    murdererDamage: 40,
                    eventDuration: 7
                };

                // Update UI
                document.getElementById('scarecrow-health').value = this.settings.scarecrowHealth;
                document.getElementById('scarecrow-health-val').innerText = this.settings.scarecrowHealth;
                document.getElementById('scarecrow-damage').value = this.settings.scarecrowDamage;
                document.getElementById('scarecrow-damage-val').innerText = this.settings.scarecrowDamage;
                document.getElementById('scarecrow-range').value = this.settings.scarecrowAggroRange;
                document.getElementById('scarecrow-range-val').innerText = this.settings.scarecrowAggroRange;
                document.getElementById('scarecrow-rate').value = this.settings.scarecrowSpawnRate;
                document.getElementById('scarecrow-rate-val').innerText = this.settings.scarecrowSpawnRate;
                document.getElementById('scarecrow-throw').checked = this.settings.scarecrowsThrowBeancans;
                document.getElementById('candy-mult').value = this.settings.candyMultiplier;
                document.getElementById('candy-mult-val').innerText = this.settings.candyMultiplier;
                document.getElementById('murderer-rate').value = this.settings.murdererSpawnRate;
                document.getElementById('murderer-rate-val').innerText = this.settings.murdererSpawnRate;
                document.getElementById('murderer-health').value = this.settings.murdererHealth;
                document.getElementById('murderer-health-val').innerText = this.settings.murdererHealth;
                document.getElementById('murderer-damage').value = this.settings.murdererDamage;
                document.getElementById('murderer-damage-val').innerText = this.settings.murdererDamage;
                document.getElementById('event-duration').value = this.settings.eventDuration;
                document.getElementById('duration-val').innerText = this.settings.eventDuration;

                this.tablet.showToast('Settings reset to default', 'info');
            }
        });
    }

    quickEvent() {
        this.active = true;
        document.getElementById('halloween-toggle').checked = true;
        document.getElementById('event-status').innerText = 'ACTIVE';
        
        // Spawn some scarecrows
        for (let i = 0; i < 5; i++) {
            this.scarecrows.push({ id: Date.now() + i });
        }
        
        this.updateStats();
        this.tablet.showToast('Quick Halloween event started!', 'success');
    }

    refresh() {
        this.updateStats();
        this.tablet.showToast('Halloween manager refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.halloweenManager = new HalloweenManager(window.drainedTablet);
});