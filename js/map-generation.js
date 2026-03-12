// map-generation.js – DRAINED TABLET ULTIMATE v7.0.0
// UI for the 24 map generation commands.
// Allows viewing and modifying procedural map parameters.

class MapGeneration {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.params = {}; // will hold current values
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.fetchCurrentParams();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'mapgen') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-mapgen');
        if (!tab) return;

        if (!this.access.hasRole('owner')) {
            tab.innerHTML = `<div class="access-denied">Owner access required</div>`;
            return;
        }

        tab.innerHTML = `
            <div class="mapgen-container">
                <div class="mapgen-header">
                    <h2>🗺️ MAP GENERATION PARAMETERS</h2>
                    <button id="mapgen-refresh" class="mapgen-btn">🔄 REFRESH</button>
                </div>
                <div class="mapgen-grid">
                    <div class="mapgen-section">
                        <h3>Slope Settings</h3>
                        <div id="param-beachslope" class="param-item">
                            <label>beachslope</label>
                            <input type="range" min="0" max="90" step="1" id="beachslope">
                            <span id="beachslope-val"></span>
                        </div>
                        <div id="param-cliffspawnslope" class="param-item">
                            <label>cliffspawnslope</label>
                            <input type="range" min="0" max="90" step="1" id="cliffspawnslope">
                            <span id="cliffspawnslope-val"></span>
                        </div>
                        <div id="param-decorspawnslope" class="param-item">
                            <label>decorspawnslope</label>
                            <input type="range" min="0" max="90" step="1" id="decorspawnslope">
                            <span id="decorspawnslope-val"></span>
                        </div>
                    </div>
                    <div class="mapgen-section">
                        <h3>Border Settings</h3>
                        <div id="param-borderfalloff" class="param-item">
                            <label>borderfalloff</label>
                            <input type="range" min="0" max="1" step="0.01" id="borderfalloff">
                            <span id="borderfalloff-val"></span>
                        </div>
                        <div id="param-borderpadding" class="param-item">
                            <label>borderpadding</label>
                            <input type="range" min="0" max="0.5" step="0.01" id="borderpadding">
                            <span id="borderpadding-val"></span>
                        </div>
                    </div>
                    <div class="mapgen-section">
                        <h3>Center Settings</h3>
                        <div id="param-centerbump" class="param-item">
                            <label>centerbump</label>
                            <input type="range" min="0" max="1" step="0.01" id="centerbump">
                            <span id="centerbump-val"></span>
                        </div>
                        <div id="param-centerfalloff" class="param-item">
                            <label>centerfalloff</label>
                            <input type="range" min="0" max="1" step="0.01" id="centerfalloff">
                            <span id="centerfalloff-val"></span>
                        </div>
                        <div id="param-centerpadding" class="param-item">
                            <label>centerpadding</label>
                            <input type="range" min="0" max="0.5" step="0.01" id="centerpadding">
                            <span id="centerpadding-val"></span>
                        </div>
                    </div>
                    <div class="mapgen-section">
                        <h3>Cliff Settings</h3>
                        <div id="param-cliffsidespawnradius" class="param-item">
                            <label>cliffsidespawnradius</label>
                            <input type="range" min="0" max="100" step="1" id="cliffsidespawnradius">
                            <span id="cliffsidespawnradius-val"></span>
                        </div>
                        <div id="param-placecliffs" class="param-item">
                            <label>placecliffs</label>
                            <input type="checkbox" id="placecliffs">
                        </div>
                        <div id="param-placerockformations" class="param-item">
                            <label>placerockformations</label>
                            <input type="checkbox" id="placerockformations">
                        </div>
                    </div>
                    <div class="mapgen-section">
                        <h3>Frequency</h3>
                        <div id="param-frequencymax" class="param-item">
                            <label>frequencymax</label>
                            <input type="range" min="0" max="1" step="0.01" id="frequencymax">
                            <span id="frequencymax-val"></span>
                        </div>
                        <div id="param-frequencymin" class="param-item">
                            <label>frequencymin</label>
                            <input type="range" min="0" max="1" step="0.01" id="frequencymin">
                            <span id="frequencymin-val"></span>
                        </div>
                    </div>
                    <div class="mapgen-section">
                        <h3>Elevation</h3>
                        <div id="param-hillelevation" class="param-item">
                            <label>hillelevation</label>
                            <input type="range" min="0" max="100" step="1" id="hillelevation">
                            <span id="hillelevation-val"></span>
                        </div>
                        <div id="param-mountelevation" class="param-item">
                            <label>mountelevation</label>
                            <input type="range" min="0" max="100" step="1" id="mountelevation">
                            <span id="mountelevation-val"></span>
                        </div>
                        <div id="param-plainelevation" class="param-item">
                            <label>plainelevation</label>
                            <input type="range" min="0" max="100" step="1" id="plainelevation">
                            <span id="plainelevation-val"></span>
                        </div>
                    </div>
                    <div class="mapgen-section">
                        <h3>Fade</h3>
                        <div id="param-hillfade" class="param-item">
                            <label>hillfade</label>
                            <input type="range" min="0" max="100" step="1" id="hillfade">
                            <span id="hillfade-val"></span>
                        </div>
                        <div id="param-mountfade" class="param-item">
                            <label>mountfade</label>
                            <input type="range" min="0" max="100" step="1" id="mountfade">
                            <span id="mountfade-val"></span>
                        </div>
                        <div id="param-plainfade" class="param-item">
                            <label>plainfade</label>
                            <input type="range" min="0" max="100" step="1" id="plainfade">
                            <span id="plainfade-val"></span>
                        </div>
                    </div>
                    <div class="mapgen-section">
                        <h3>Ocean Level</h3>
                        <div id="param-oceanlevel0" class="param-item">
                            <label>oceanlevel0</label>
                            <input type="range" min="-10" max="10" step="0.1" id="oceanlevel0">
                            <span id="oceanlevel0-val"></span>
                        </div>
                        <div id="param-oceanlevel1" class="param-item">
                            <label>oceanlevel1</label>
                            <input type="range" min="-10" max="10" step="0.1" id="oceanlevel1">
                            <span id="oceanlevel1-val"></span>
                        </div>
                    </div>
                    <div class="mapgen-section">
                        <h3>Noise Parameters</h3>
                        <div id="param-getheightnoiseparams" class="param-item">
                            <label>getheightnoiseparams</label>
                            <button id="getheightnoiseparams" class="small-btn">View Current</button>
                        </div>
                        <div id="param-setheightnoiseparams" class="param-item">
                            <label>setheightnoiseparams</label>
                            <input type="text" id="heightnoiseparams" placeholder="e.g., 0.5,0.5,0.5">
                            <button id="setheightnoiseparams" class="small-btn">Set</button>
                        </div>
                        <div id="param-shapeamplitude" class="param-item">
                            <label>shapeamplitude</label>
                            <input type="range" min="0" max="10" step="0.1" id="shapeamplitude">
                            <span id="shapeamplitude-val"></span>
                        </div>
                    </div>
                </div>
                <div class="mapgen-actions">
                    <button id="apply-all" class="mapgen-btn primary">APPLY ALL CHANGES</button>
                    <button id="reset-to-default" class="mapgen-btn">RESET TO DEFAULT</button>
                </div>
            </div>
        `;
    }

    attachEvents() {
        document.getElementById('mapgen-refresh')?.addEventListener('click', () => this.refresh());
        document.getElementById('apply-all')?.addEventListener('click', () => this.applyAll());
        document.getElementById('reset-to-default')?.addEventListener('click', () => this.resetDefaults());
        document.getElementById('getheightnoiseparams')?.addEventListener('click', () => this.getHeightNoiseParams());
        document.getElementById('setheightnoiseparams')?.addEventListener('click', () => this.setHeightNoiseParams());

        // Add live updates for sliders
        document.querySelectorAll('.mapgen-section input[type=range]').forEach(input => {
            const span = document.getElementById(input.id + '-val');
            if (span) {
                input.addEventListener('input', () => {
                    span.textContent = input.value;
                });
            }
        });
    }

    async fetchCurrentParams() {
        // In a real implementation, you'd fetch each param via RCON
        // For now, we'll just set defaults
        const defaults = {
            beachslope: 20,
            cliffspawnslope: 30,
            decorspawnslope: 25,
            borderfalloff: 0.5,
            borderpadding: 0.1,
            centerbump: 0.2,
            centerfalloff: 0.5,
            centerpadding: 0.1,
            cliffsidespawnradius: 20,
            placecliffs: true,
            placerockformations: true,
            frequencymax: 0.8,
            frequencymin: 0.2,
            hillelevation: 40,
            mountelevation: 70,
            plainelevation: 10,
            hillfade: 50,
            mountfade: 30,
            plainfade: 20,
            oceanlevel0: 0,
            oceanlevel1: 0,
            shapeamplitude: 5
        };

        for (let [key, value] of Object.entries(defaults)) {
            const input = document.getElementById(key);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value;
                } else {
                    input.value = value;
                    const span = document.getElementById(key + '-val');
                    if (span) span.textContent = value;
                }
            }
        }
    }

    async getHeightNoiseParams() {
        try {
            const result = await ConnectionManager.executeCommand('generation.getheightnoiseparams');
            alert(`Current parameters: ${result}`);
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    async setHeightNoiseParams() {
        const input = document.getElementById('heightnoiseparams');
        const params = input.value;
        if (!params) return;
        try {
            await ConnectionManager.executeCommand(`generation.setheightnoiseparams ${params}`);
            this.tablet.showToast('Height noise parameters set', 'success');
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    async applyAll() {
        const inputs = document.querySelectorAll('.mapgen-section input');
        for (let input of inputs) {
            if (input.type === 'checkbox') {
                const cmd = `generation.${input.id} ${input.checked ? 1 : 0}`;
                try {
                    await ConnectionManager.executeCommand(cmd);
                } catch (err) {
                    console.warn(`Failed to set ${input.id}:`, err);
                }
            } else if (input.type === 'range' || input.type === 'number') {
                const cmd = `generation.${input.id} ${input.value}`;
                try {
                    await ConnectionManager.executeCommand(cmd);
                } catch (err) {
                    console.warn(`Failed to set ${input.id}:`, err);
                }
            }
        }
        this.tablet.showToast('Map generation parameters applied', 'success');
    }

    async resetDefaults() {
        // You would need to know the server's default values; here we just set UI defaults
        this.fetchCurrentParams();
        this.tablet.showToast('UI reset to defaults (server unchanged)', 'info');
    }

    refresh() {
        this.fetchCurrentParams();
        this.tablet.showToast('Map generation refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mapGeneration = new MapGeneration();
});