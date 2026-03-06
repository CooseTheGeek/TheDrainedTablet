// EXPLOSIVES MANAGER - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class ExplosivesManager {
    constructor(tablet) {
        this.tablet = tablet;
        this.settings = this.loadSettings();
        this.init();
    }

    loadSettings() {
        const saved = localStorage.getItem('drained_explosives_settings');
        return saved ? JSON.parse(saved) : {
            c4Damage: 1.0,
            rocketDamage: 1.0,
            satchelDamage: 1.0,
            timedDamage: 1.0,
            splashRadius: 1.0,
            wallResistance: 1.0,
            doorResistance: 1.0
        };
    }

    saveSettings() {
        localStorage.setItem('drained_explosives_settings', JSON.stringify(this.settings));
    }

    init() {
        this.createExplosivesHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'explosives') {
                this.refresh();
            }
        });
    }

    createExplosivesHTML() {
        const explosivesTab = document.getElementById('tab-explosives');
        if (!explosivesTab) return;

        explosivesTab.innerHTML = `
            <div class="explosives-container">
                <div class="explosives-header">
                    <h2>💥 EXPLOSIVES & RAID BALANCING</h2>
                </div>

                <div class="explosives-grid">
                    <div class="explosive-section">
                        <h3>💣 EXPLOSIVE DAMAGE</h3>
                        
                        <div class="setting-item">
                            <label>C4 Damage: <span id="c4-val">${this.settings.c4Damage}</span>x</label>
                            <input type="range" id="c4-damage" min="0.1" max="3" step="0.1" value="${this.settings.c4Damage}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Rocket Damage: <span id="rocket-val">${this.settings.rocketDamage}</span>x</label>
                            <input type="range" id="rocket-damage" min="0.1" max="3" step="0.1" value="${this.settings.rocketDamage}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Satchel Damage: <span id="satchel-val">${this.settings.satchelDamage}</span>x</label>
                            <input type="range" id="satchel-damage" min="0.1" max="3" step="0.1" value="${this.settings.satchelDamage}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Timed Explosive: <span id="timed-val">${this.settings.timedDamage}</span>x</label>
                            <input type="range" id="timed-damage" min="0.1" max="3" step="0.1" value="${this.settings.timedDamage}">
                        </div>
                    </div>

                    <div class="explosive-section">
                        <h3>💥 EXPLOSION PHYSICS</h3>
                        
                        <div class="setting-item">
                            <label>Splash Radius: <span id="radius-val">${this.settings.splashRadius}</span>x</label>
                            <input type="range" id="splash-radius" min="0.5" max="2" step="0.1" value="${this.settings.splashRadius}">
                        </div>
                    </div>

                    <div class="explosive-section">
                        <h3>🛡️ BUILDING RESISTANCE</h3>
                        
                        <div class="setting-item">
                            <label>Wall Resistance: <span id="wall-val">${this.settings.wallResistance}</span>x</label>
                            <input type="range" id="wall-resistance" min="0.5" max="3" step="0.1" value="${this.settings.wallResistance}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Door Resistance: <span id="door-val">${this.settings.doorResistance}</span>x</label>
                            <input type="range" id="door-resistance" min="0.5" max="3" step="0.1" value="${this.settings.doorResistance}">
                        </div>
                    </div>

                    <div class="explosive-section">
                        <h3>📊 RAID CALCULATOR</h3>
                        
                        <div class="calculator-inputs">
                            <div class="form-group">
                                <label>Target Type:</label>
                                <select id="calc-target">
                                    <option value="stone">Stone Wall</option>
                                    <option value="metal">Metal Wall</option>
                                    <option value="armored">Armored Wall</option>
                                    <option value="stone-door">Stone Door</option>
                                    <option value="metal-door">Metal Door</option>
                                    <option value="armored-door">Armored Door</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Explosive Type:</label>
                                <select id="calc-explosive">
                                    <option value="c4">C4</option>
                                    <option value="rocket">Rocket</option>
                                    <option value="satchel">Satchel</option>
                                    <option value="timed">Timed Explosive</option>
                                </select>
                            </div>
                            
                            <button id="calculate-raid" class="explosive-btn">CALCULATE</button>
                        </div>
                        
                        <div id="calc-result" class="calc-result">
                            Enter values to calculate
                        </div>
                    </div>
                </div>

                <div class="explosives-actions">
                    <button id="save-explosives" class="explosive-btn primary">💾 SAVE SETTINGS</button>
                    <button id="reset-explosives" class="explosive-btn">🔄 RESET</button>
                    <button id="test-raid" class="explosive-btn">⚡ TEST RAID</button>
                </div>

                <div class="warning-box">
                    ⚠️ Changes to explosive damage affect all raiding mechanics.
                </div>
            </div>
        `;

        this.setupRangeListeners();
    }

    setupEventListeners() {
        document.getElementById('save-explosives')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-explosives')?.addEventListener('click', () => this.resetSettings());
        document.getElementById('test-raid')?.addEventListener('click', () => this.testRaid());
        document.getElementById('calculate-raid')?.addEventListener('click', () => this.calculateRaid());

        this.setupRangeListeners();
    }

    setupRangeListeners() {
        const ranges = [
            { id: 'c4-damage', val: 'c4-val' },
            { id: 'rocket-damage', val: 'rocket-val' },
            { id: 'satchel-damage', val: 'satchel-val' },
            { id: 'timed-damage', val: 'timed-val' },
            { id: 'splash-radius', val: 'radius-val' },
            { id: 'wall-resistance', val: 'wall-val' },
            { id: 'door-resistance', val: 'door-val' }
        ];

        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });
    }

    saveSettings() {
        this.settings = {
            c4Damage: parseFloat(document.getElementById('c4-damage').value),
            rocketDamage: parseFloat(document.getElementById('rocket-damage').value),
            satchelDamage: parseFloat(document.getElementById('satchel-damage').value),
            timedDamage: parseFloat(document.getElementById('timed-damage').value),
            splashRadius: parseFloat(document.getElementById('splash-radius').value),
            wallResistance: parseFloat(document.getElementById('wall-resistance').value),
            doorResistance: parseFloat(document.getElementById('door-resistance').value)
        };

        this.saveSettings();
        this.tablet.showToast('Explosives settings saved', 'success');
    }

    resetSettings() {
        this.tablet.showConfirm('Reset explosives settings?', (confirmed) => {
            if (confirmed) {
                this.settings = {
                    c4Damage: 1.0,
                    rocketDamage: 1.0,
                    satchelDamage: 1.0,
                    timedDamage: 1.0,
                    splashRadius: 1.0,
                    wallResistance: 1.0,
                    doorResistance: 1.0
                };

                // Update UI
                document.getElementById('c4-damage').value = this.settings.c4Damage;
                document.getElementById('c4-val').innerText = this.settings.c4Damage;
                document.getElementById('rocket-damage').value = this.settings.rocketDamage;
                document.getElementById('rocket-val').innerText = this.settings.rocketDamage;
                document.getElementById('satchel-damage').value = this.settings.satchelDamage;
                document.getElementById('satchel-val').innerText = this.settings.satchelDamage;
                document.getElementById('timed-damage').value = this.settings.timedDamage;
                document.getElementById('timed-val').innerText = this.settings.timedDamage;
                document.getElementById('splash-radius').value = this.settings.splashRadius;
                document.getElementById('radius-val').innerText = this.settings.splashRadius;
                document.getElementById('wall-resistance').value = this.settings.wallResistance;
                document.getElementById('wall-val').innerText = this.settings.wallResistance;
                document.getElementById('door-resistance').value = this.settings.doorResistance;
                document.getElementById('door-val').innerText = this.settings.doorResistance;

                this.tablet.showToast('Settings reset', 'info');
            }
        });
    }

    calculateRaid() {
        const target = document.getElementById('calc-target').value;
        const explosive = document.getElementById('calc-explosive').value;

        // Base values (simplified)
        const baseHealth = {
            'stone': 500,
            'metal': 1000,
            'armored': 2000,
            'stone-door': 250,
            'metal-door': 500,
            'armored-door': 1000
        };

        const baseDamage = {
            'c4': 500,
            'rocket': 400,
            'satchel': 300,
            'timed': 500
        };

        const health = baseHealth[target] * (target.includes('door') ? this.settings.doorResistance : this.settings.wallResistance);
        const damage = baseDamage[explosive] * this.settings[explosive + 'Damage'];
        
        const count = Math.ceil(health / damage);
        const result = document.getElementById('calc-result');
        result.innerHTML = `
            <strong>Result:</strong><br>
            Required: ${count} ${explosive.toUpperCase()}${count > 1 ? 's' : ''}<br>
            Total Damage: ${count * damage}<br>
            Target Health: ${health}
        `;
    }

    testRaid() {
        const target = prompt('Enter target (stone/metal/armored):', 'stone');
        const explosive = prompt('Enter explosive (c4/rocket/satchel):', 'c4');
        
        if (target && explosive) {
            this.tablet.showToast(`Testing raid with ${explosive} on ${target}...`, 'info');
            setTimeout(() => {
                this.tablet.showToast('Raid simulation complete', 'success');
            }, 2000);
        }
    }

    refresh() {
        this.tablet.showToast('Explosives manager refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.explosivesManager = new ExplosivesManager(window.drainedTablet);
});