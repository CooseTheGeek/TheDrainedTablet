// MODIFIERS MANAGER - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class ModifierManager {
    constructor(tablet) {
        this.tablet = tablet;
        this.modifiers = this.loadModifiers();
        this.globalModifiers = this.loadGlobalModifiers();
        this.init();
    }

    loadModifiers() {
        const saved = localStorage.getItem('drained_modifiers');
        return saved ? JSON.parse(saved) : {
            items: {},
            categories: {}
        };
    }

    loadGlobalModifiers() {
        const saved = localStorage.getItem('drained_global_modifiers');
        return saved ? JSON.parse(saved) : {
            furnaceUsage: 1.0,
            furnaceOutput: 1.0,
            cookSpeed: 1.0,
            charcoalRate: 1.0,
            quarrySpeed: 1.0,
            crudeOilOutput: 1.0,
            lowGradeOutput: 1.0
        };
    }

    saveModifiers() {
        localStorage.setItem('drained_modifiers', JSON.stringify(this.modifiers));
    }

    saveGlobalModifiers() {
        localStorage.setItem('drained_global_modifiers', JSON.stringify(this.globalModifiers));
    }

    init() {
        this.createModifiersHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'modifiers') {
                this.refresh();
            }
        });
    }

    createModifiersHTML() {
        const modTab = document.getElementById('tab-modifiers');
        if (!modTab) return;

        modTab.innerHTML = `
            <div class="modifiers-container">
                <div class="modifiers-header">
                    <h2>⚙️ ITEM MODIFIERS</h2>
                    <div class="mod-controls">
                        <button id="refresh-mods" class="mod-btn">🔄 REFRESH</button>
                        <button id="clear-all-mods" class="mod-btn warning">🧹 CLEAR ALL</button>
                    </div>
                </div>

                <div class="modifiers-tabs">
                    <button class="mod-tab active" data-tab="items">📦 ITEM MODIFIERS</button>
                    <button class="mod-tab" data-tab="global">🌍 GLOBAL MODIFIERS</button>
                    <button class="mod-tab" data-tab="presets">🎯 PRESETS</button>
                </div>

                <div id="items-tab" class="mod-tab-content active">
                    <div class="item-selector">
                        <input type="text" id="mod-item-search" placeholder="Search item...">
                        <select id="mod-category">
                            <option value="all">All Categories</option>
                            <option value="Weapons">Weapons</option>
                            <option value="Tools">Tools</option>
                            <option value="Resources">Resources</option>
                        </select>
                    </div>

                    <div class="modifiers-grid" id="modifiers-grid"></div>
                </div>

                <div id="global-tab" class="mod-tab-content">
                    <div class="global-modifiers">
                        <h3>FURNACE MODIFIERS</h3>
                        <div class="mod-control">
                            <label>Fuel Usage: <span id="furnace-usage-val">${this.globalModifiers.furnaceUsage}x</span></label>
                            <input type="range" id="furnace-usage" min="0.1" max="5" step="0.1" value="${this.globalModifiers.furnaceUsage}">
                        </div>
                        <div class="mod-control">
                            <label>Output Multiplier: <span id="furnace-output-val">${this.globalModifiers.furnaceOutput}x</span></label>
                            <input type="range" id="furnace-output" min="0.1" max="5" step="0.1" value="${this.globalModifiers.furnaceOutput}">
                        </div>
                        <div class="mod-control">
                            <label>Cook Speed: <span id="cook-speed-val">${this.globalModifiers.cookSpeed}x</span></label>
                            <input type="range" id="cook-speed" min="0.1" max="5" step="0.1" value="${this.globalModifiers.cookSpeed}">
                        </div>

                        <h3>RESOURCE MODIFIERS</h3>
                        <div class="mod-control">
                            <label>Charcoal Rate: <span id="charcoal-rate-val">${this.globalModifiers.charcoalRate}x</span></label>
                            <input type="range" id="charcoal-rate" min="0.1" max="5" step="0.1" value="${this.globalModifiers.charcoalRate}">
                        </div>
                        <div class="mod-control">
                            <label>Quarry Speed: <span id="quarry-speed-val">${this.globalModifiers.quarrySpeed}x</span></label>
                            <input type="range" id="quarry-speed" min="0.1" max="5" step="0.1" value="${this.globalModifiers.quarrySpeed}">
                        </div>

                        <h3>OIL MODIFIERS</h3>
                        <div class="mod-control">
                            <label>Crude Oil Output: <span id="crude-oil-val">${this.globalModifiers.crudeOilOutput}x</span></label>
                            <input type="range" id="crude-oil" min="0.1" max="5" step="0.1" value="${this.globalModifiers.crudeOilOutput}">
                        </div>
                        <div class="mod-control">
                            <label>Low Grade Output: <span id="low-grade-val">${this.globalModifiers.lowGradeOutput}x</span></label>
                            <input type="range" id="low-grade" min="0.1" max="5" step="0.1" value="${this.globalModifiers.lowGradeOutput}">
                        </div>

                        <button id="apply-global" class="mod-btn primary">APPLY GLOBAL MODIFIERS</button>
                    </div>
                </div>

                <div id="presets-tab" class="mod-tab-content">
                    <div class="presets-grid">
                        <div class="preset-card" data-preset="2x">
                            <h4>2X COLLECTION</h4>
                            <p>Double gather rates</p>
                            <button class="load-preset">LOAD</button>
                        </div>
                        <div class="preset-card" data-preset="3x">
                            <h4>3X COLLECTION</h4>
                            <p>Triple gather rates</p>
                            <button class="load-preset">LOAD</button>
                        </div>
                        <div class="preset-card" data-preset="fast-smelt">
                            <h4>FAST SMELTING</h4>
                            <p>2x cook speed, 2x output</p>
                            <button class="load-preset">LOAD</button>
                        </div>
                        <div class="preset-card" data-preset="economy">
                            <h4>ECONOMY</h4>
                            <p>50% fuel usage, 2x output</p>
                            <button class="load-preset">LOAD</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderItemModifiers();
        this.updateGlobalDisplay();
    }

    setupEventListeners() {
        document.getElementById('refresh-mods')?.addEventListener('click', () => this.refresh());
        document.getElementById('clear-all-mods')?.addEventListener('click', () => this.clearAllModifiers());

        document.querySelectorAll('.mod-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.mod-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.mod-tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(e.target.dataset.tab + '-tab').classList.add('active');
            });
        });

        // Global modifier sliders
        const globalSliders = [
            { id: 'furnace-usage', display: 'furnace-usage-val' },
            { id: 'furnace-output', display: 'furnace-output-val' },
            { id: 'cook-speed', display: 'cook-speed-val' },
            { id: 'charcoal-rate', display: 'charcoal-rate-val' },
            { id: 'quarry-speed', display: 'quarry-speed-val' },
            { id: 'crude-oil', display: 'crude-oil-val' },
            { id: 'low-grade', display: 'low-grade-val' }
        ];

        globalSliders.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.display).innerText = e.target.value + 'x';
            });
        });

        document.getElementById('apply-global')?.addEventListener('click', () => this.applyGlobalModifiers());

        document.querySelectorAll('.load-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.closest('.preset-card').dataset.preset;
                this.loadPreset(preset);
            });
        });

        document.getElementById('mod-item-search')?.addEventListener('input', () => this.renderItemModifiers());
        document.getElementById('mod-category')?.addEventListener('change', () => this.renderItemModifiers());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('apply-mod')) {
                const item = e.target.dataset.item;
                const type = e.target.dataset.type;
                this.showModifierDialog(item, type);
            }
            if (e.target.classList.contains('clear-mod')) {
                const item = e.target.dataset.item;
                const type = e.target.dataset.type;
                this.clearModifier(item, type);
            }
        });
    }

    renderItemModifiers() {
        const grid = document.getElementById('modifiers-grid');
        if (!grid) return;

        const search = document.getElementById('mod-item-search')?.value.toLowerCase() || '';
        const category = document.getElementById('mod-category')?.value || 'all';

        // Sample items for demo
        const items = [
            { name: 'Stone Pickaxe', shortname: 'pickaxe', category: 'Tools' },
            { name: 'Hatchet', shortname: 'hatchet', category: 'Tools' },
            { name: 'Jackhammer', shortname: 'jackhammer', category: 'Tools' },
            { name: 'AK-47', shortname: 'rifle.ak', category: 'Weapons' },
            { name: 'Bolt Rifle', shortname: 'rifle.bolt', category: 'Weapons' },
            { name: 'Sulfur Ore', shortname: 'sulfur.ore', category: 'Resources' },
            { name: 'Metal Ore', shortname: 'metal.ore', category: 'Resources' }
        ];

        let filtered = items;
        if (search) {
            filtered = filtered.filter(i => 
                i.name.toLowerCase().includes(search) || 
                i.shortname.includes(search)
            );
        }
        if (category !== 'all') {
            filtered = filtered.filter(i => i.category === category);
        }

        let html = '';
        filtered.forEach(item => {
            const itemMods = this.modifiers.items[item.shortname] || {};
            html += `
                <div class="modifier-card">
                    <div class="mod-item-header">
                        <span class="item-name">${item.name}</span>
                        <span class="item-short">${item.shortname}</span>
                    </div>
                    <div class="mod-types">
                        <div class="mod-type">
                            <span>Collection:</span>
                            <span class="mod-value">${itemMods.collection || '1.0'}x</span>
                            <button class="small-btn apply-mod" data-item="${item.shortname}" data-type="collection">✏️</button>
                            ${itemMods.collection ? `<button class="small-btn clear-mod" data-item="${item.shortname}" data-type="collection">🗑️</button>` : ''}
                        </div>
                        <div class="mod-type">
                            <span>Gather:</span>
                            <span class="mod-value">${itemMods.gather || '1.0'}x</span>
                            <button class="small-btn apply-mod" data-item="${item.shortname}" data-type="gather">✏️</button>
                        </div>
                        <div class="mod-type">
                            <span>Tool:</span>
                            <span class="mod-value">${itemMods.tool || '1.0'}x</span>
                            <button class="small-btn apply-mod" data-item="${item.shortname}" data-type="tool">✏️</button>
                        </div>
                        <div class="mod-type">
                            <span>Loot:</span>
                            <span class="mod-value">${itemMods.loot || '1.0'}x</span>
                            <button class="small-btn apply-mod" data-item="${item.shortname}" data-type="loot">✏️</button>
                        </div>
                        <div class="mod-type">
                            <span>Cook Speed:</span>
                            <span class="mod-value">${itemMods.cookspeed || '1.0'}x</span>
                            <button class="small-btn apply-mod" data-item="${item.shortname}" data-type="cookspeed">✏️</button>
                        </div>
                        <div class="mod-type">
                            <span>Cook Amount:</span>
                            <span class="mod-value">${itemMods.cookamount || '1.0'}x</span>
                            <button class="small-btn apply-mod" data-item="${item.shortname}" data-type="cookamount">✏️</button>
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    showModifierDialog(item, type) {
        const value = prompt(`Enter ${type} multiplier for ${item} (0.1-10.0):`, '1.0');
        if (value) {
            if (!this.modifiers.items[item]) {
                this.modifiers.items[item] = {};
            }
            this.modifiers.items[item][type] = parseFloat(value);
            this.saveModifiers();
            this.renderItemModifiers();
            this.tablet.showToast(`${type} modifier set to ${value}x`, 'success');
        }
    }

    clearModifier(item, type) {
        if (this.modifiers.items[item]) {
            delete this.modifiers.items[item][type];
            if (Object.keys(this.modifiers.items[item]).length === 0) {
                delete this.modifiers.items[item];
            }
            this.saveModifiers();
            this.renderItemModifiers();
            this.tablet.showToast(`${type} modifier cleared`, 'info');
        }
    }

    updateGlobalDisplay() {
        document.getElementById('furnace-usage').value = this.globalModifiers.furnaceUsage;
        document.getElementById('furnace-usage-val').innerText = this.globalModifiers.furnaceUsage + 'x';
        document.getElementById('furnace-output').value = this.globalModifiers.furnaceOutput;
        document.getElementById('furnace-output-val').innerText = this.globalModifiers.furnaceOutput + 'x';
        document.getElementById('cook-speed').value = this.globalModifiers.cookSpeed;
        document.getElementById('cook-speed-val').innerText = this.globalModifiers.cookSpeed + 'x';
        document.getElementById('charcoal-rate').value = this.globalModifiers.charcoalRate;
        document.getElementById('charcoal-rate-val').innerText = this.globalModifiers.charcoalRate + 'x';
        document.getElementById('quarry-speed').value = this.globalModifiers.quarrySpeed;
        document.getElementById('quarry-speed-val').innerText = this.globalModifiers.quarrySpeed + 'x';
        document.getElementById('crude-oil').value = this.globalModifiers.crudeOilOutput;
        document.getElementById('crude-oil-val').innerText = this.globalModifiers.crudeOilOutput + 'x';
        document.getElementById('low-grade').value = this.globalModifiers.lowGradeOutput;
        document.getElementById('low-grade-val').innerText = this.globalModifiers.lowGradeOutput + 'x';
    }

    applyGlobalModifiers() {
        this.globalModifiers = {
            furnaceUsage: parseFloat(document.getElementById('furnace-usage').value),
            furnaceOutput: parseFloat(document.getElementById('furnace-output').value),
            cookSpeed: parseFloat(document.getElementById('cook-speed').value),
            charcoalRate: parseFloat(document.getElementById('charcoal-rate').value),
            quarrySpeed: parseFloat(document.getElementById('quarry-speed').value),
            crudeOilOutput: parseFloat(document.getElementById('crude-oil').value),
            lowGradeOutput: parseFloat(document.getElementById('low-grade').value)
        };

        this.saveGlobalModifiers();
        this.tablet.showToast('Global modifiers applied', 'success');
    }

    loadPreset(preset) {
        switch(preset) {
            case '2x':
                this.globalModifiers = {
                    furnaceUsage: 1.0,
                    furnaceOutput: 2.0,
                    cookSpeed: 2.0,
                    charcoalRate: 2.0,
                    quarrySpeed: 2.0,
                    crudeOilOutput: 2.0,
                    lowGradeOutput: 2.0
                };
                break;
            case '3x':
                this.globalModifiers = {
                    furnaceUsage: 1.0,
                    furnaceOutput: 3.0,
                    cookSpeed: 3.0,
                    charcoalRate: 3.0,
                    quarrySpeed: 3.0,
                    crudeOilOutput: 3.0,
                    lowGradeOutput: 3.0
                };
                break;
            case 'fast-smelt':
                this.globalModifiers = {
                    furnaceUsage: 0.5,
                    furnaceOutput: 2.0,
                    cookSpeed: 2.0,
                    charcoalRate: 1.5,
                    quarrySpeed: 1.0,
                    crudeOilOutput: 1.0,
                    lowGradeOutput: 1.0
                };
                break;
            case 'economy':
                this.globalModifiers = {
                    furnaceUsage: 0.5,
                    furnaceOutput: 2.0,
                    cookSpeed: 1.5,
                    charcoalRate: 2.0,
                    quarrySpeed: 1.5,
                    crudeOilOutput: 1.5,
                    lowGradeOutput: 1.5
                };
                break;
        }

        this.updateGlobalDisplay();
        this.saveGlobalModifiers();
        this.tablet.showToast(`Loaded ${preset} preset`, 'success');
    }

    clearAllModifiers() {
        this.tablet.showConfirm('Clear ALL modifiers?', (confirmed) => {
            if (confirmed) {
                this.modifiers = { items: {}, categories: {} };
                this.globalModifiers = {
                    furnaceUsage: 1.0,
                    furnaceOutput: 1.0,
                    cookSpeed: 1.0,
                    charcoalRate: 1.0,
                    quarrySpeed: 1.0,
                    crudeOilOutput: 1.0,
                    lowGradeOutput: 1.0
                };
                this.saveModifiers();
                this.saveGlobalModifiers();
                this.renderItemModifiers();
                this.updateGlobalDisplay();
                this.tablet.showToast('All modifiers cleared', 'info');
            }
        });
    }

    refresh() {
        this.renderItemModifiers();
        this.updateGlobalDisplay();
        this.tablet.showToast('Modifiers refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.modifierManager = new ModifierManager(window.drainedTablet);
});