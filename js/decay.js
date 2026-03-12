// decay.js – DRAINED TABLET ULTIMATE v7.0.0
// Decay and upkeep settings management.
// All original presets and features preserved, now with RCON integration.

class Decay {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
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
        this.settings = this.loadSettings();
        this.init();
    }

    loadSettings() {
        const saved = localStorage.getItem('tdl_decay_settings');
        return saved ? JSON.parse(saved) : this.presets.vanilla;
    }

    saveSettings() {
        localStorage.setItem('tdl_decay_settings', JSON.stringify(this.settings));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'decay') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-decay');
        if (!tab) return;

        if (!this.access.hasRole('owner')) {
            tab.innerHTML = '<div class="access-denied">Owner access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="decay-container">
                <div class="decay-header">
                    <h2>⏳ DECAY & UPKEEP</h2>
                </div>

                <div class="decay-grid">
                    <div class="decay-section">
                        <h3>CURRENT SETTINGS</h3>
                        <div class="setting-item">
                            <label>Upkeep Enabled: <span id="upkeep-val">${this.settings.upkeep}</span></label>
                            <input type="checkbox" id="upkeep" ${this.settings.upkeep ? 'checked' : ''}>
                        </div>
                        <div class="setting-item">
                            <label>Decay Scale: <span id="scale-val">${this.settings.scale}</span></label>
                            <input type="range" id="scale" min="0.1" max="5" step="0.1" value="${this.settings.scale}">
                        </div>
                        <div class="setting-item">
                            <label>Tick Rate: <span id="tick-val">${this.settings.tick}</span>s</label>
                            <input type="range" id="tick" min="60" max="3600" step="60" value="${this.settings.tick}">
                        </div>

                        <h4>Brackets</h4>
                        <div class="bracket-item">
                            <label>Bracket 0 (blocks ≤ <span id="bracket0-val">${this.settings.bracket0}</span>): cost <span id="bracket0cost-val">${this.settings.bracket0cost}</span></label>
                            <input type="range" id="bracket0" min="1" max="50" value="${this.settings.bracket0}">
                            <input type="range" id="bracket0cost" min="0.01" max="1" step="0.01" value="${this.settings.bracket0cost}">
                        </div>
                        <div class="bracket-item">
                            <label>Bracket 1 (blocks ≤ <span id="bracket1-val">${this.settings.bracket1}</span>): cost <span id="bracket1cost-val">${this.settings.bracket1cost}</span></label>
                            <input type="range" id="bracket1" min="10" max="200" value="${this.settings.bracket1}">
                            <input type="range" id="bracket1cost" min="0.01" max="1" step="0.01" value="${this.settings.bracket1cost}">
                        </div>
                        <div class="bracket-item">
                            <label>Bracket 2 (blocks ≤ <span id="bracket2-val">${this.settings.bracket2}</span>): cost <span id="bracket2cost-val">${this.settings.bracket2cost}</span></label>
                            <input type="range" id="bracket2" min="50" max="500" value="${this.settings.bracket2}">
                            <input type="range" id="bracket2cost" min="0.01" max="1" step="0.01" value="${this.settings.bracket2cost}">
                        </div>
                        <div class="bracket-item">
                            <label>Bracket 3 (blocks ≤ <span id="bracket3-val">${this.settings.bracket3}</span>): cost <span id="bracket3cost-val">${this.settings.bracket3cost}</span></label>
                            <input type="range" id="bracket3" min="100" max="1000" value="${this.settings.bracket3}">
                            <input type="range" id="bracket3cost" min="0.01" max="1" step="0.01" value="${this.settings.bracket3cost}">
                        </div>
                    </div>

                    <div class="decay-section">
                        <h3>DELAY & DURATION</h3>
                        <div class="material-group">
                            <h4>Twig</h4>
                            <label>Delay: <span id="delayTwig-val">${this.settings.delayTwig}</span>h</label>
                            <input type="range" id="delayTwig" min="0" max="24" value="${this.settings.delayTwig}">
                            <label>Duration: <span id="durationTwig-val">${this.settings.durationTwig}</span>h</label>
                            <input type="range" id="durationTwig" min="1" max="48" value="${this.settings.durationTwig}">
                        </div>
                        <div class="material-group">
                            <h4>Wood</h4>
                            <label>Delay: <span id="delayWood-val">${this.settings.delayWood}</span>h</label>
                            <input type="range" id="delayWood" min="0" max="24" value="${this.settings.delayWood}">
                            <label>Duration: <span id="durationWood-val">${this.settings.durationWood}</span>h</label>
                            <input type="range" id="durationWood" min="1" max="48" value="${this.settings.durationWood}">
                        </div>
                        <div class="material-group">
                            <h4>Stone</h4>
                            <label>Delay: <span id="delayStone-val">${this.settings.delayStone}</span>h</label>
                            <input type="range" id="delayStone" min="0" max="24" value="${this.settings.delayStone}">
                            <label>Duration: <span id="durationStone-val">${this.settings.durationStone}</span>h</label>
                            <input type="range" id="durationStone" min="1" max="48" value="${this.settings.durationStone}">
                        </div>
                        <div class="material-group">
                            <h4>Metal</h4>
                            <label>Delay: <span id="delayMetal-val">${this.settings.delayMetal}</span>h</label>
                            <input type="range" id="delayMetal" min="0" max="24" value="${this.settings.delayMetal}">
                            <label>Duration: <span id="durationMetal-val">${this.settings.durationMetal}</span>h</label>
                            <input type="range" id="durationMetal" min="1" max="48" value="${this.settings.durationMetal}">
                        </div>
                        <div class="material-group">
                            <h4>Armored</h4>
                            <label>Delay: <span id="delayToptier-val">${this.settings.delayToptier}</span>h</label>
                            <input type="range" id="delayToptier" min="0" max="24" value="${this.settings.delayToptier}">
                            <label>Duration: <span id="durationToptier-val">${this.settings.durationToptier}</span>h</label>
                            <input type="range" id="durationToptier" min="1" max="48" value="${this.settings.durationToptier}">
                        </div>
                    </div>
                </div>

                <div class="decay-presets">
                    <h3>PRESETS</h3>
                    <button id="preset-vanilla" class="decay-btn">Vanilla</button>
                    <button id="preset-doubled" class="decay-btn">2x Decay</button>
                    <button id="preset-softcore" class="decay-btn">Softcore</button>
                </div>

                <div class="decay-actions">
                    <button id="apply-decay" class="decay-btn primary">💾 APPLY SETTINGS</button>
                    <button id="test-decay" class="decay-btn">⚡ TEST</button>
                </div>
            </div>
        `;

        this.setupRangeListeners();
    }

    setupRangeListeners() {
        const ranges = [
            'scale', 'tick',
            'bracket0', 'bracket0cost', 'bracket1', 'bracket1cost',
            'bracket2', 'bracket2cost', 'bracket3', 'bracket3cost',
            'delayTwig', 'durationTwig', 'delayWood', 'durationWood',
            'delayStone', 'durationStone', 'delayMetal', 'durationMetal',
            'delayToptier', 'durationToptier'
        ];
        ranges.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', (e) => {
                    const valSpan = document.getElementById(id + '-val');
                    if (valSpan) valSpan.innerText = e.target.value;
                });
            }
        });
    }

    attachEvents() {
        document.getElementById('preset-vanilla')?.addEventListener('click', () => this.loadPreset('vanilla'));
        document.getElementById('preset-doubled')?.addEventListener('click', () => this.loadPreset('doubled'));
        document.getElementById('preset-softcore')?.addEventListener('click', () => this.loadPreset('softcore'));
        document.getElementById('apply-decay')?.addEventListener('click', () => this.applySettings());
        document.getElementById('test-decay')?.addEventListener('click', () => this.testSettings());
        document.getElementById('upkeep')?.addEventListener('change', (e) => {
            document.getElementById('upkeep-val').innerText = e.target.checked;
        });
    }

    loadPreset(name) {
        this.settings = this.presets[name];
        // Update UI
        document.getElementById('upkeep').checked = this.settings.upkeep;
        document.getElementById('upkeep-val').innerText = this.settings.upkeep;
        document.getElementById('scale').value = this.settings.scale;
        document.getElementById('scale-val').innerText = this.settings.scale;
        document.getElementById('tick').value = this.settings.tick;
        document.getElementById('tick-val').innerText = this.settings.tick;
        document.getElementById('bracket0').value = this.settings.bracket0;
        document.getElementById('bracket0-val').innerText = this.settings.bracket0;
        document.getElementById('bracket0cost').value = this.settings.bracket0cost;
        document.getElementById('bracket0cost-val').innerText = this.settings.bracket0cost;
        document.getElementById('bracket1').value = this.settings.bracket1;
        document.getElementById('bracket1-val').innerText = this.settings.bracket1;
        document.getElementById('bracket1cost').value = this.settings.bracket1cost;
        document.getElementById('bracket1cost-val').innerText = this.settings.bracket1cost;
        document.getElementById('bracket2').value = this.settings.bracket2;
        document.getElementById('bracket2-val').innerText = this.settings.bracket2;
        document.getElementById('bracket2cost').value = this.settings.bracket2cost;
        document.getElementById('bracket2cost-val').innerText = this.settings.bracket2cost;
        document.getElementById('bracket3').value = this.settings.bracket3;
        document.getElementById('bracket3-val').innerText = this.settings.bracket3;
        document.getElementById('bracket3cost').value = this.settings.bracket3cost;
        document.getElementById('bracket3cost-val').innerText = this.settings.bracket3cost;
        document.getElementById('delayTwig').value = this.settings.delayTwig;
        document.getElementById('delayTwig-val').innerText = this.settings.delayTwig;
        document.getElementById('durationTwig').value = this.settings.durationTwig;
        document.getElementById('durationTwig-val').innerText = this.settings.durationTwig;
        document.getElementById('delayWood').value = this.settings.delayWood;
        document.getElementById('delayWood-val').innerText = this.settings.delayWood;
        document.getElementById('durationWood').value = this.settings.durationWood;
        document.getElementById('durationWood-val').innerText = this.settings.durationWood;
        document.getElementById('delayStone').value = this.settings.delayStone;
        document.getElementById('delayStone-val').innerText = this.settings.delayStone;
        document.getElementById('durationStone').value = this.settings.durationStone;
        document.getElementById('durationStone-val').innerText = this.settings.durationStone;
        document.getElementById('delayMetal').value = this.settings.delayMetal;
        document.getElementById('delayMetal-val').innerText = this.settings.delayMetal;
        document.getElementById('durationMetal').value = this.settings.durationMetal;
        document.getElementById('durationMetal-val').innerText = this.settings.durationMetal;
        document.getElementById('delayToptier').value = this.settings.delayToptier;
        document.getElementById('delayToptier-val').innerText = this.settings.delayToptier;
        document.getElementById('durationToptier').value = this.settings.durationToptier;
        document.getElementById('durationToptier-val').innerText = this.settings.durationToptier;
        this.tablet.showToast(`Loaded ${name} decay preset`, 'success');
    }

    async applySettings() {
        if (!this.access.isMaster()) return;
        // Collect all settings from UI
        this.settings = {
            upkeep: document.getElementById('upkeep').checked,
            scale: parseFloat(document.getElementById('scale').value),
            tick: parseInt(document.getElementById('tick').value),
            bracket0: parseInt(document.getElementById('bracket0').value),
            bracket0cost: parseFloat(document.getElementById('bracket0cost').value),
            bracket1: parseInt(document.getElementById('bracket1').value),
            bracket1cost: parseFloat(document.getElementById('bracket1cost').value),
            bracket2: parseInt(document.getElementById('bracket2').value),
            bracket2cost: parseFloat(document.getElementById('bracket2cost').value),
            bracket3: parseInt(document.getElementById('bracket3').value),
            bracket3cost: parseFloat(document.getElementById('bracket3cost').value),
            delayTwig: parseInt(document.getElementById('delayTwig').value),
            durationTwig: parseInt(document.getElementById('durationTwig').value),
            delayWood: parseInt(document.getElementById('delayWood').value),
            durationWood: parseInt(document.getElementById('durationWood').value),
            delayStone: parseInt(document.getElementById('delayStone').value),
            durationStone: parseInt(document.getElementById('durationStone').value),
            delayMetal: parseInt(document.getElementById('delayMetal').value),
            durationMetal: parseInt(document.getElementById('durationMetal').value),
            delayToptier: parseInt(document.getElementById('delayToptier').value),
            durationToptier: parseInt(document.getElementById('durationToptier').value)
        };
        this.saveSettings();

        // Apply via RCON (if connected)
        if (AppState.connection.status === 'connected') {
            try {
                await ConnectionManager.executeCommand(`decay.upkeep ${this.settings.upkeep}`);
                await ConnectionManager.executeCommand(`decay.scale ${this.settings.scale}`);
                await ConnectionManager.executeCommand(`decay.tick ${this.settings.tick}`);
                await ConnectionManager.executeCommand(`decay.bracket_0_blockcount ${this.settings.bracket0}`);
                await ConnectionManager.executeCommand(`decay.bracket_0_costfraction ${this.settings.bracket0cost}`);
                await ConnectionManager.executeCommand(`decay.bracket_1_blockcount ${this.settings.bracket1}`);
                await ConnectionManager.executeCommand(`decay.bracket_1_costfraction ${this.settings.bracket1cost}`);
                await ConnectionManager.executeCommand(`decay.bracket_2_blockcount ${this.settings.bracket2}`);
                await ConnectionManager.executeCommand(`decay.bracket_2_costfraction ${this.settings.bracket2cost}`);
                await ConnectionManager.executeCommand(`decay.bracket_3_blockcount ${this.settings.bracket3}`);
                await ConnectionManager.executeCommand(`decay.bracket_3_costfraction ${this.settings.bracket3cost}`);
                await ConnectionManager.executeCommand(`decay.delay_twig ${this.settings.delayTwig}`);
                await ConnectionManager.executeCommand(`decay.duration_twig ${this.settings.durationTwig}`);
                await ConnectionManager.executeCommand(`decay.delay_wood ${this.settings.delayWood}`);
                await ConnectionManager.executeCommand(`decay.duration_wood ${this.settings.durationWood}`);
                await ConnectionManager.executeCommand(`decay.delay_stone ${this.settings.delayStone}`);
                await ConnectionManager.executeCommand(`decay.duration_stone ${this.settings.durationStone}`);
                await ConnectionManager.executeCommand(`decay.delay_metal ${this.settings.delayMetal}`);
                await ConnectionManager.executeCommand(`decay.duration_metal ${this.settings.durationMetal}`);
                await ConnectionManager.executeCommand(`decay.delay_toptier ${this.settings.delayToptier}`);
                await ConnectionManager.executeCommand(`decay.duration_toptier ${this.settings.durationToptier}`);
                this.tablet.showToast('Decay settings applied', 'success');
            } catch (err) {
                this.tablet.showError('Failed to apply decay settings: ' + err.message);
            }
        } else {
            this.tablet.showToast('Settings saved locally (server not connected)', 'info');
        }
    }

    testSettings() {
        // Simple test calculation
        const testBase = { blocks: 100, grade: 'stone', protected: true };
        const decayAmount = testBase.blocks * this.settings.scale * 0.01;
        this.tablet.showToast(`Test decay: ${decayAmount.toFixed(2)} damage per tick`, 'info');
    }

    refresh() {
        // Reload settings from storage and update UI
        this.settings = this.loadSettings();
        this.loadPreset('vanilla'); // hack to refresh UI – could be more precise
        this.tablet.showToast('Decay settings refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.decay = new Decay();
});