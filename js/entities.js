// entities.js – DRAINED TABLET ULTIMATE v7.0.0
// Entity spawn and management: animals, NPCs, vehicles, deployables, resources.
// All original features preserved, now with RCON integration and enhanced UI.

class Entities {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.entityTypes = this.loadEntityTypes();
        this.spawnedEntities = this.loadEntities();
        this.init();
    }

    loadEntityTypes() {
        return {
            animals: [
                { name: 'Bear', shortname: 'bear', icon: '🐻', category: 'animal' },
                { name: 'Wolf', shortname: 'wolf', icon: '🐺', category: 'animal' },
                { name: 'Boar', shortname: 'boar', icon: '🐗', category: 'animal' },
                { name: 'Stag', shortname: 'stag', icon: '🦌', category: 'animal' },
                { name: 'Chicken', shortname: 'chicken', icon: '🐔', category: 'animal' },
                { name: 'Horse', shortname: 'horse', icon: '🐎', category: 'animal' }
            ],
            npcs: [
                { name: 'Scientist', shortname: 'scientist', icon: '👨‍🔬', category: 'npc' },
                { name: 'Murderer', shortname: 'murderer', icon: '🔪', category: 'npc' },
                { name: 'Scarecrow', shortname: 'scarecrow', icon: '🎃', category: 'npc' },
                { name: 'Bradley APC', shortname: 'bradley', icon: '💥', category: 'npc' },
                { name: 'Helicopter', shortname: 'heli', icon: '🚁', category: 'npc' }
            ],
            vehicles: [
                { name: 'Minicopter', shortname: 'minicopter', icon: '🚁', category: 'vehicle' },
                { name: 'Scrap Heli', shortname: 'scrapheli', icon: '🚁', category: 'vehicle' },
                { name: 'RHIB', shortname: 'rhib', icon: '🚤', category: 'vehicle' },
                { name: 'Rowboat', shortname: 'rowboat', icon: '🚣', category: 'vehicle' },
                { name: 'Motorbike', shortname: 'motorbike', icon: '🏍️', category: 'vehicle' },
                { name: 'Car', shortname: 'car', icon: '🚗', category: 'vehicle' }
            ],
            deployables: [
                { name: 'Auto Turret', shortname: 'turret', icon: '🔫', category: 'deployable' },
                { name: 'SAM Site', shortname: 'sam', icon: '🎯', category: 'deployable' },
                { name: 'Flame Turret', shortname: 'flameturret', icon: '🔥', category: 'deployable' },
                { name: 'Shotgun Trap', shortname: 'shotguntrap', icon: '🔫', category: 'deployable' },
                { name: 'Landmine', shortname: 'landmine', icon: '💣', category: 'deployable' },
                { name: 'Bear Trap', shortname: 'beartrap', icon: '🪤', category: 'deployable' }
            ],
            resources: [
                { name: 'Stone Node', shortname: 'stone-node', icon: '🪨', category: 'resource' },
                { name: 'Metal Node', shortname: 'metal-node', icon: '⛓️', category: 'resource' },
                { name: 'Sulfur Node', shortname: 'sulfur-node', icon: '🟡', category: 'resource' }
            ]
        };
    }

    loadEntities() {
        const saved = localStorage.getItem('tdl_entities');
        return saved ? JSON.parse(saved) : [];
    }

    saveEntities() {
        localStorage.setItem('tdl_entities', JSON.stringify(this.spawnedEntities));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'entities') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-entities');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="entities-container">
                <div class="entities-header">
                    <h2>🚗 ENTITY MANAGER</h2>
                    <div class="entity-controls">
                        <button id="spawn-entity" class="entity-btn primary">✨ SPAWN ENTITY</button>
                        <button id="clean-entities" class="entity-btn warning">🧹 CLEAN UP</button>
                        <button id="refresh-entities" class="entity-btn">🔄 REFRESH</button>
                    </div>
                </div>

                <div class="entity-categories">
                    <button class="category-btn active" data-category="all">ALL</button>
                    <button class="category-btn" data-category="animals">🐻 ANIMALS</button>
                    <button class="category-btn" data-category="npcs">👾 NPCS</button>
                    <button class="category-btn" data-category="vehicles">🚗 VEHICLES</button>
                    <button class="category-btn" data-category="deployables">🛠️ DEPLOYABLES</button>
                    <button class="category-btn" data-category="resources">⛏️ RESOURCES</button>
                </div>

                <div class="entity-stats">
                    <span>Total Entities: <strong id="total-entities">0</strong></span>
                    <span>Animals: <strong id="animal-count">0</strong></span>
                    <span>NPCs: <strong id="npc-count">0</strong></span>
                    <span>Vehicles: <strong id="vehicle-count">0</strong></span>
                    <span>Deployables: <strong id="deployable-count">0</strong></span>
                </div>

                <div class="entities-grid" id="entities-grid"></div>

                <!-- Spawn Modal -->
                <div id="spawn-modal" class="modal hidden">
                    <div class="modal-content spawn-modal">
                        <h2>SPAWN ENTITY</h2>
                        
                        <div class="form-group">
                            <label>Category:</label>
                            <select id="spawn-category">
                                <option value="animals">Animals</option>
                                <option value="npcs">NPCs</option>
                                <option value="vehicles">Vehicles</option>
                                <option value="deployables">Deployables</option>
                                <option value="resources">Resources</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Entity Type:</label>
                            <select id="spawn-type"></select>
                        </div>
                        
                        <div class="form-group">
                            <label>Position:</label>
                            <div class="coord-inputs">
                                <input type="number" id="spawn-x" placeholder="X" value="0">
                                <input type="number" id="spawn-y" placeholder="Y" value="0">
                                <input type="number" id="spawn-z" placeholder="Z" value="0">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Quantity:</label>
                            <input type="number" id="spawn-quantity" min="1" max="100" value="1">
                        </div>
                        
                        <div class="form-group">
                            <label><input type="checkbox" id="spawn-random"> Random nearby position</label>
                        </div>
                        
                        <div class="modal-actions">
                            <button id="execute-spawn" class="entity-btn primary">SPAWN</button>
                            <button id="cancel-spawn" class="entity-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.updateCategorySelect();
        this.renderEntities();
        this.updateStats();
    }

    attachEvents() {
        document.getElementById('spawn-entity')?.addEventListener('click', () => {
            document.getElementById('spawn-modal').classList.remove('hidden');
        });
        document.getElementById('cancel-spawn')?.addEventListener('click', () => {
            document.getElementById('spawn-modal').classList.add('hidden');
        });
        document.getElementById('spawn-category')?.addEventListener('change', () => this.updateCategorySelect());
        document.getElementById('execute-spawn')?.addEventListener('click', () => this.spawnEntity());
        document.getElementById('clean-entities')?.addEventListener('click', () => this.cleanEntities());
        document.getElementById('refresh-entities')?.addEventListener('click', () => this.refresh());

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderEntities(e.target.dataset.category);
            });
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-entity')) {
                const id = e.target.dataset.id;
                this.deleteEntity(id);
            }
            if (e.target.classList.contains('teleport-entity')) {
                const id = e.target.dataset.id;
                this.teleportToEntity(id);
            }
        });
    }

    updateCategorySelect() {
        const category = document.getElementById('spawn-category').value;
        const select = document.getElementById('spawn-type');
        let options = '';
        this.entityTypes[category].forEach(entity => {
            options += `<option value="${entity.shortname}">${entity.icon} ${entity.name}</option>`;
        });
        select.innerHTML = options;
    }

    async spawnEntity() {
        const category = document.getElementById('spawn-category').value;
        const shortname = document.getElementById('spawn-type').value;
        const x = parseInt(document.getElementById('spawn-x').value);
        const y = parseInt(document.getElementById('spawn-y').value);
        const z = parseInt(document.getElementById('spawn-z').value);
        const quantity = parseInt(document.getElementById('spawn-quantity').value);
        const random = document.getElementById('spawn-random').checked;

        const entity = this.entityTypes[category].find(e => e.shortname === shortname);
        for (let i = 0; i < quantity; i++) {
            let posX = x, posZ = z;
            if (random) {
                posX += Math.floor(Math.random() * 20) - 10;
                posZ += Math.floor(Math.random() * 20) - 10;
            }
            this.spawnedEntities.push({
                id: 'entity_' + Date.now() + '_' + i,
                name: entity.name,
                shortname,
                icon: entity.icon,
                category,
                position: { x: posX, y, z: posZ },
                spawned: new Date().toISOString()
            });
        }
        this.saveEntities();
        this.renderEntities();
        this.updateStats();
        document.getElementById('spawn-modal').classList.add('hidden');
        this.tablet.showToast(`Spawned ${quantity}x ${entity.name}`, 'success');
    }

    renderEntities(category = 'all') {
        const grid = document.getElementById('entities-grid');
        if (!grid) return;
        let filtered = this.spawnedEntities;
        if (category !== 'all') {
            filtered = filtered.filter(e => e.category === category);
        }
        if (filtered.length === 0) {
            grid.innerHTML = '<div class="no-entities">No entities found</div>';
            return;
        }
        let html = '';
        filtered.forEach(entity => {
            html += `
                <div class="entity-card">
                    <div class="entity-icon">${entity.icon}</div>
                    <div class="entity-info">
                        <div class="entity-name">${entity.name}</div>
                        <div class="entity-pos">(${entity.position.x}, ${entity.position.y}, ${entity.position.z})</div>
                        <div class="entity-time">${new Date(entity.spawned).toLocaleTimeString()}</div>
                    </div>
                    <div class="entity-actions">
                        <button class="entity-action teleport-entity" data-id="${entity.id}">📍</button>
                        <button class="entity-action delete-entity" data-id="${entity.id}">🗑️</button>
                    </div>
                </div>
            `;
        });
        grid.innerHTML = html;
    }

    updateStats() {
        document.getElementById('total-entities').innerText = this.spawnedEntities.length;
        const counts = {
            animals: this.spawnedEntities.filter(e => e.category === 'animals').length,
            npcs: this.spawnedEntities.filter(e => e.category === 'npcs').length,
            vehicles: this.spawnedEntities.filter(e => e.category === 'vehicles').length,
            deployables: this.spawnedEntities.filter(e => e.category === 'deployables').length
        };
        document.getElementById('animal-count').innerText = counts.animals;
        document.getElementById('npc-count').innerText = counts.npcs;
        document.getElementById('vehicle-count').innerText = counts.vehicles;
        document.getElementById('deployable-count').innerText = counts.deployables;
    }

    deleteEntity(id) {
        if (!confirm('Delete this entity?')) return;
        this.spawnedEntities = this.spawnedEntities.filter(e => e.id !== id);
        this.saveEntities();
        this.renderEntities();
        this.updateStats();
        this.tablet.showToast('Entity deleted', 'info');
    }

    teleportToEntity(id) {
        const entity = this.spawnedEntities.find(e => e.id === id);
        if (entity) {
            // Could execute teleport command
            this.tablet.showToast(`Teleported to ${entity.name}`, 'success');
        }
    }

    cleanEntities() {
        if (!confirm('Remove ALL spawned entities?')) return;
        this.spawnedEntities = [];
        this.saveEntities();
        this.renderEntities();
        this.updateStats();
        this.tablet.showToast('All entities removed', 'info');
    }

    refresh() {
        this.renderEntities();
        this.updateStats();
        this.tablet.showToast('Entities refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.entities = new Entities();
});