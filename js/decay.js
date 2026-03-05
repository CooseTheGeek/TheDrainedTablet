// DECAY SYSTEM - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class DecaySystem {
    constructor(tablet) {
        this.tablet = tablet;
        this.settings = this.loadSettings();
        this.presets = {
            vanilla: {
                upkeep: true,
                scale: 1.0,
                tick: 600,
                bracket0: 15,
                bracket0cost: 0.1,
                bracket1: 50,
                bracket1cost: 0.15,
                bracket2: 125,
                bracket2cost: 0.2,
                bracket3: 200,
                bracket3cost: 0.333,
                delayTwig: 0,
                delayWood: 0,
                delayStone: 0,
                delayMetal: 0,
                delayToptier: 0,
                durationTwig: 1,
                durationWood: 3,
                durationStone: 5,
                durationMetal: 8,
                durationToptier: 12
            },
            doubled: {
                upkeep: true,
                scale: 2.0,
                tick: 300,
                bracket0: 20,
                bracket0cost: 0.2,
                bracket1: 75,
                bracket1cost: 0.25,
                bracket2: 150,
                bracket2cost: 0.3,
                bracket3: 250,
                bracket3cost: 0.4,
                delayTwig: 1,
                delayWood: 2,
                delayStone: 4,
                delayMetal: 6,
                delayToptier: 8,
                durationTwig: 2,
                durationWood: 4,
                durationStone: 6,
                durationMetal: 10,
                durationToptier: 14
            },
            softcore: {
                upkeep: true,
                scale: 0.5,
                tick: 1200,
                bracket0: 10,
                bracket0cost: 0.05,
                bracket1: 30,
                bracket1cost: 0.08,
                bracket2: 80,
                bracket2cost: 0.1,
                bracket3: 150,
                bracket3cost: 0.15,
                delayTwig: 2,
                delayWood: 4,
                delayStone: 8,
                delayMetal: 12,
                delayToptier: 24,
                durationTwig: 4,
                durationWood: 8,
                durationStone: 12,
                durationMetal: 18,
                durationToptier: 24
            }
        };
        this.init();
    }

    loadSettings() {
        const saved = localStorage.getItem('drained_decay_settings');
        return saved ? JSON.parse(saved) : this.presets.vanilla;
    }

    saveSettings() {
        localStorage.setItem('drained_decay_settings', JSON.stringify(this.settings));
    }

    init() {
        this.createDecayHTML();
        this.setupEventListeners();
    }

    createDecayHTML() {
        const decayTab = document.getElementById('tab-decay');
        if (!decayTab) return;

        decayTab.innerHTML = `
            <div class="decay-container">
                <div class="decay-header">
                    <h2>⏳ DECAY & UPKEEP CONTROL</h2>
                    <div class="decay-presets">
                        <button class="preset-btn" data-preset="vanilla">VANILLA</button>
                        <button class="preset-btn" data-preset="doubled">2X</button>
                        <button class="preset-btn" data-preset="softcore">SOFTCORE</button>
                        <button class="preset-btn" id="save-preset">💾 SAVE AS CUSTOM</button>
                    </div>
                </div>

                <div class="decay-grid">
                    <!-- Master Controls -->
                    <div class="decay-section">
                        <h3>MASTER CONTROLS</h3>
                        <div class="control-group">
                            <label>
                                <input type="checkbox" id="upkeep-enabled" ${this.settings.upkeep ? 'checked' : ''}>
                                Enable Upkeep
                            </label>
                            <div class="warning-text">⚠️ Disabling upkeep will stop all decay</div>
                        </div>
                        
                        <div class="control-group">
                            <label>Decay Scale: <span id="scale-value">${this.settings.scale}</span>x</label>
                            <input type="range" id="decay-scale" min="0.1" max="5" step="0.1" value="${this.settings.scale}">
                        </div>
                        
                        <div class="control-group">
                            <label>Decay Tick: <span id="tick-value">${this.settings.tick}</span> seconds</label>
                            <input type="range" id="decay-tick" min="60" max="3600" step="60" value="${this.settings.tick}">
                        </div>
                    </div>

                    <!-- Bracket System -->
                    <div class="decay-section">
                        <h3>BRACKET SYSTEM</h3>
                        <div class="bracket-group">
                            <h4>Bracket 0</h4>
                            <label>Block Count: <input type="number" id="bracket0-count" value="${this.settings.bracket0}"></label>
                            <label>Cost Fraction: <input type="number" id="bracket0-cost" step="0.01" min="0" max="1" value="${this.settings.bracket0cost}"></label>
                        </div>
                        
                        <div class="bracket-group">
                            <h4>Bracket 1</h4>
                            <label>Block Count: <input type="number" id="bracket1-count" value="${this.settings.bracket1}"></label>
                            <label>Cost Fraction: <input type="number" id="bracket1-cost" step="0.01" min="0" max="1" value="${this.settings.bracket1cost}"></label>
                        </div>
                        
                        <div class="bracket-group">
                            <h4>Bracket 2</h4>
                            <label>Block Count: <input type="number" id="bracket2-count" value="${this.settings.bracket2}"></label>
                            <label>Cost Fraction: <input type="number" id="bracket2-cost" step="0.01" min="0" max="1" value="${this.settings.bracket2cost}"></label>
                        </div>
                        
                        <div class="bracket-group">
                            <h4>Bracket 3</h4>
                            <label>Block Count: <input type="number" id="bracket3-count" value="${this.settings.bracket3}"></label>
                            <label>Cost Fraction: <input type="number" id="bracket3-cost" step="0.01" min="0" max="1" value="${this.settings.bracket3cost}"></label>
                        </div>
                    </div>

                    <!-- Delay Settings -->
                    <div class="decay-section">
                        <h3>DELAY SETTINGS (hours)</h3>
                        <div class="delay-grid">
                            <label>Twig: <input type="number" id="delay-twig" step="0.1" value="${this.settings.delayTwig}"></label>
                            <label>Wood: <input type="number" id="delay-wood" step="0.1" value="${this.settings.delayWood}"></label>
                            <label>Stone: <input type="number" id="delay-stone" step="0.1" value="${this.settings.delayStone}"></label>
                            <label>Metal: <input type="number" id="delay-metal" step="0.1" value="${this.settings.delayMetal}"></label>
                            <label>HQM: <input type="number" id="delay-toptier" step="0.1" value="${this.settings.delayToptier}"></label>
                        </div>
                        <div class="control-group">
                            <label>Override: <input type="number" id="delay-override" step="0.1" value="0"></label>
                        </div>
                    </div>

                    <!-- Duration Settings -->
                    <div class="decay-section">
                        <h3>DURATION SETTINGS (hours)</h3>
                        <div class="duration-grid">
                            <label>Twig: <input type="number" id="duration-twig" step="0.1" value="${this.settings.durationTwig}"></label>
                            <label>Wood: <input type="number" id="duration-wood" step="0.1" value="${this.settings.durationWood}"></label>
                            <label>Stone: <input type="number" id="duration-stone" step="0.1" value="${this.settings.durationStone}"></label>
                            <label>Metal: <input type="number" id="duration-metal" step="0.1" value="${this.settings.durationMetal}"></label>
                            <label>HQM: <input type="number" id="duration-toptier" step="0.1" value="${this.settings.durationToptier}"></label>
                        </div>
                        <div class="control-group">
                            <label>Override: <input type="number" id="duration-override" step="0.1" value="0"></label>
                        </div>
                    </div>

                    <!-- Upgrade Toggles -->
                    <div class="decay-section">
                        <h3>UPGRADE PERMISSIONS</h3>
                        <div class="toggle-group">
                            <label>
                                <input type="checkbox" id="upgrade-hqm" ${this.settings.upgradeHqm ? 'checked' : ''}>
                                Allow HQM Upgrades
                            </label>
                            <label>
                                <input type="checkbox" id="upgrade-metal" ${this.settings.upgradeMetal ? 'checked' : ''}>
                                Allow Metal Upgrades
                            </label>
                            <label>
                                <input type="checkbox" id="upgrade-stone" ${this.settings.upgradeStone ? 'checked' : ''}>
                                Allow Stone Upgrades
                            </label>
                            <label>
                                <input type="checkbox" id="upgrade-wood" ${this.settings.upgradeWood ? 'checked' : ''}>
                                Allow Wood Upgrades
                            </label>
                        </div>
                    </div>

                    <!-- Additional Settings -->
                    <div class="decay-section">
                        <h3>ADDITIONAL SETTINGS</h3>
                        <div class="control-group">
                            <label>Upkeep Period: <span id="period-value">1440</span> minutes</label>
                            <input type="range" id="upkeep-period" min="60" max="4320" step="60" value="1440">
                        </div>
                        
                        <div class="control-group">
                            <label>Grief Protection: <span id="grief-value">1440</span> minutes</label>
                            <input type="range" id="grief-protection" min="0" max="10080" step="60" value="1440">
                        </div>
                        
                        <div class="control-group">
                            <label>Heal Scale: <span id="heal-value">1.0</span>x</label>
                            <input type="range" id="heal-scale" min="0.1" max="3" step="0.1" value="1.0">
                        </div>
                    </div>
                </div>

                <div class="decay-actions">
                    <button id="apply-decay" class="decay-btn primary">APPLY CHANGES</button>
                    <button id="reset-decay" class="decay-btn">RESET TO VANILLA</button>
                    <button id="test-decay" class="decay-btn">TEST SETTINGS</button>
                </div>

                <div class="warning-box">
                    ⚠️ WARNING: Changes to decay settings may require a server restart to take effect.
                </div>
            </div>
        `;

        this.updateDisplayValues();
    }

    setupEventListeners() {
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.id === 'save-preset') {
                    this.saveCustomPreset();
                } else {
                    this.loadPreset(e.target.dataset.preset);
                }
            });
        });

        // Range inputs
        document.getElementById('decay-scale')?.addEventListener('input', (e) => {
            document.getElementById('scale-value').innerText = e.target.value;
        });

        document.getElementById('decay-tick')?.addEventListener('input', (e) => {
            document.getElementById('tick-value').innerText = e.target.value;
        });

        document.getElementById('upkeep-period')?.addEventListener('input', (e) => {
            document.getElementById('period-value').innerText = e.target.value;
        });

        document.getElementById('grief-protection')?.addEventListener('input', (e) => {
            document.getElementById('grief-value').innerText = e.target.value;
        });

        document.getElementById('heal-scale')?.addEventListener('input', (e) => {
            document.getElementById('heal-value').innerText = e.target.value;
        });

        // Action buttons
        document.getElementById('apply-decay')?.addEventListener('click', () => this.applySettings());
        document.getElementById('reset-decay')?.addEventListener('click', () => this.resetToVanilla());
        document.getElementById('test-decay')?.addEventListener('click', () => this.testSettings());
    }

    loadPreset(presetName) {
        this.settings = this.presets[presetName];
        this.updateInputs();
        this.tablet.showToast(`Loaded ${presetName} preset`, 'success');
    }

    saveCustomPreset() {
        this.gatherSettings();
        const name = prompt('Enter preset name:');
        if (name) {
            this.presets[name] = { ...this.settings };
            this.tablet.showToast(`Preset "${name}" saved`, 'success');
        }
    }

    gatherSettings() {
        this.settings = {
            upkeep: document.getElementById('upkeep-enabled').checked,
            scale: parseFloat(document.getElementById('decay-scale').value),
            tick: parseInt(document.getElementById('decay-tick').value),
            bracket0: parseInt(document.getElementById('bracket0-count').value),
            bracket0cost: parseFloat(document.getElementById('bracket0-cost').value),
            bracket1: parseInt(document.getElementById('bracket1-count').value),
            bracket1cost: parseFloat(document.getElementById('bracket1-cost').value),
            bracket2: parseInt(document.getElementById('bracket2-count').value),
            bracket2cost: parseFloat(document.getElementById('bracket2-cost').value),
            bracket3: parseInt(document.getElementById('bracket3-count').value),
            bracket3cost: parseFloat(document.getElementById('bracket3-cost').value),
            delayTwig: parseFloat(document.getElementById('delay-twig').value),
            delayWood: parseFloat(document.getElementById('delay-wood').value),
            delayStone: parseFloat(document.getElementById('delay-stone').value),
            delayMetal: parseFloat(document.getElementById('delay-metal').value),
            delayToptier: parseFloat(document.getElementById('delay-toptier').value),
            durationTwig: parseFloat(document.getElementById('duration-twig').value),
            durationWood: parseFloat(document.getElementById('duration-wood').value),
            durationStone: parseFloat(document.getElementById('duration-stone').value),
            durationMetal: parseFloat(document.getElementById('duration-metal').value),
            durationToptier: parseFloat(document.getElementById('duration-toptier').value),
            upgradeHqm: document.getElementById('upgrade-hqm').checked,
            upgradeMetal: document.getElementById('upgrade-metal').checked,
            upgradeStone: document.getElementById('upgrade-stone').checked,
            upgradeWood: document.getElementById('upgrade-wood').checked
        };
    }

    updateInputs() {
        document.getElementById('upkeep-enabled').checked = this.settings.upkeep;
        document.getElementById('decay-scale').value = this.settings.scale;
        document.getElementById('scale-value').innerText = this.settings.scale;
        document.getElementById('decay-tick').value = this.settings.tick;
        document.getElementById('tick-value').innerText = this.settings.tick;
        
        document.getElementById('bracket0-count').value = this.settings.bracket0;
        document.getElementById('bracket0-cost').value = this.settings.bracket0cost;
        document.getElementById('bracket1-count').value = this.settings.bracket1;
        document.getElementById('bracket1-cost').value = this.settings.bracket1cost;
        document.getElementById('bracket2-count').value = this.settings.bracket2;
        document.getElementById('bracket2-cost').value = this.settings.bracket2cost;
        document.getElementById('bracket3-count').value = this.settings.bracket3;
        document.getElementById('bracket3-cost').value = this.settings.bracket3cost;
        
        document.getElementById('delay-twig').value = this.settings.delayTwig;
        document.getElementById('delay-wood').value = this.settings.delayWood;
        document.getElementById('delay-stone').value = this.settings.delayStone;
        document.getElementById('delay-metal').value = this.settings.delayMetal;
        document.getElementById('delay-toptier').value = this.settings.delayToptier;
        
        document.getElementById('duration-twig').value = this.settings.durationTwig;
        document.getElementById('duration-wood').value = this.settings.durationWood;
        document.getElementById('duration-stone').value = this.settings.durationStone;
        document.getElementById('duration-metal').value = this.settings.durationMetal;
        document.getElementById('duration-toptier').value = this.settings.durationToptier;
        
        document.getElementById('upgrade-hqm').checked = this.settings.upgradeHqm;
        document.getElementById('upgrade-metal').checked = this.settings.upgradeMetal;
        document.getElementById('upgrade-stone').checked = this.settings.upgradeStone;
        document.getElementById('upgrade-wood').checked = this.settings.upgradeWood;
    }

    updateDisplayValues() {
        // Update all range display values
        document.getElementById('scale-value').innerText = this.settings.scale;
        document.getElementById('tick-value').innerText = this.settings.tick;
        document.getElementById('period-value').innerText = '1440';
        document.getElementById('grief-value').innerText = '1440';
        document.getElementById('heal-value').innerText = '1.0';
    }

    applySettings() {
        this.gatherSettings();
        this.saveSettings();

        // Check if restart is needed
        const needsRestart = ['scale', 'tick'].some(key => 
            this.settings[key] !== this.presets.vanilla[key]
        );

        if (needsRestart) {
            this.tablet.showConfirm(
                '⚠️ These changes require a server restart to take effect. Restart now?',
                (confirmed) => {
                    if (confirmed) {
                        this.tablet.showToast('Restarting server...', 'warning');
                        // In real version, would send restart command
                    } else {
                        this.tablet.showToast('Settings saved. Restart server to apply.', 'info');
                    }
                }
            );
        } else {
            this.tablet.showToast('Decay settings applied', 'success');
        }
    }

    resetToVanilla() {
        this.tablet.showConfirm('Reset all decay settings to vanilla?', (confirmed) => {
            if (confirmed) {
                this.settings = this.presets.vanilla;
                this.updateInputs();
                this.saveSettings();
                this.tablet.showToast('Reset to vanilla settings', 'success');
            }
        });
    }

    testSettings() {
        // Simulate decay calculation
        const testBase = {
            blocks: 100,
            grade: 'stone',
            protected: true
        };

        const decayAmount = testBase.blocks * this.settings.scale * 0.01;
        this.tablet.showToast(`Test decay: ${decayAmount.toFixed(2)} damage per tick`, 'info');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.decaySystem = new DecaySystem(window.drainedTablet);
});