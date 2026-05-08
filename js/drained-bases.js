// drained-bases.js – DRAINED TABLET ULTIMATE v7.0.0
// Player blueprint system: purchase, deploy, manage. Supports 2x1, 2x2, 3x3 with offsets.

class DrainedBases {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.db = window.database;
        this.blueprints = [];
        this.purchases = [];
        this.deployingId = null;
        this.init();
    }

    async init() {
        await this.loadBlueprints();
        await this.loadMyPurchases();
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'drained-bases') this.refresh();
        });
    }

    getDefaultBlueprints() {
        return [
            {
                id: 1,
                name: "2x1 Starter",
                description: "Compact starter base with airlock, TC, and sleeping bag.",
                price: 250,
                blocks: [
                    { shortname: "wall.frame", x: 0, y: 0, z: 0 },
                    { shortname: "floor", x: 0, y: 0, z: 1 },
                    { shortname: "door.hinged.wood", x: 0, y: 0, z: -1 },
                    { shortname: "cupboard.tool", x: 0, y: 0, z: 1 },
                    { shortname: "sleepingbag", x: 1, y: 0, z: 0 }
                ]
            },
            {
                id: 2,
                name: "2x2 Medium Base",
                description: "Spacious 2x2 with airlock, TC, bags, and storage.",
                price: 500,
                blocks: [
                    { shortname: "wall.frame", x: 0, y: 0, z: 0 },
                    { shortname: "floor", x: 0, y: 0, z: 1 },
                    { shortname: "floor", x: 1, y: 0, z: 0 },
                    { shortname: "floor", x: 1, y: 0, z: 1 },
                    { shortname: "door.hinged.wood", x: 0, y: 0, z: -1 },
                    { shortname: "cupboard.tool", x: 1, y: 0, z: 1 },
                    { shortname: "sleepingbag", x: 0, y: 0, z: 2 },
                    { shortname: "sleepingbag", x: 2, y: 0, z: 0 },
                    { shortname: "box.wooden", x: 0, y: 0, z: 2 }
                ]
            },
            {
                id: 3,
                name: "3x3 Fortress",
                description: "Large 3x3 with honeycomb potential, TC, multiple bags, storage.",
                price: 1000,
                blocks: [
                    { shortname: "floor", x: 0, y: 0, z: 0 }, { shortname: "floor", x: 1, y: 0, z: 0 }, { shortname: "floor", x: 2, y: 0, z: 0 },
                    { shortname: "floor", x: 0, y: 0, z: 1 }, { shortname: "floor", x: 1, y: 0, z: 1 }, { shortname: "floor", x: 2, y: 0, z: 1 },
                    { shortname: "floor", x: 0, y: 0, z: 2 }, { shortname: "floor", x: 1, y: 0, z: 2 }, { shortname: "floor", x: 2, y: 0, z: 2 },
                    { shortname: "wall.frame", x: 0, y: 0, z: -1 },
                    { shortname: "door.hinged.wood", x: 1, y: 0, z: -1 },
                    { shortname: "cupboard.tool", x: 1, y: 0, z: 1 },
                    { shortname: "sleepingbag", x: 0, y: 0, z: 3 }, { shortname: "sleepingbag", x: 2, y: 0, z: 3 },
                    { shortname: "box.wooden", x: 0, y: 0, z: 3 }, { shortname: "box.wooden", x: 2, y: 0, z: 3 }
                ]
            }
        ];
    }

    async loadBlueprints() {
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/drained/blueprints`);
            if (!res.ok) throw new Error('Failed to fetch blueprints');
            this.blueprints = await res.json();
            if (!this.blueprints || this.blueprints.length === 0) {
                this.blueprints = this.getDefaultBlueprints();
            }
        } catch (err) {
            console.warn('Using fallback blueprints', err);
            this.blueprints = this.getDefaultBlueprints();
        }
    }

    async loadMyPurchases() {
        const playerId = AppState.user.platformId;
        if (!playerId) {
            this.purchases = [];
            return;
        }
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/drained/purchases/${encodeURIComponent(playerId)}`);
            if (!res.ok) throw new Error('Failed to fetch purchases');
            this.purchases = await res.json();
        } catch (err) {
            this.purchases = [];
        }
    }

    createHTML() {
        const tab = document.getElementById('tab-drained-bases');
        if (!tab) return;

        tab.innerHTML = `
            <div class="bps-container">
                <div class="bps-header">
                    <h2>🏕️ DRAINED LAND'S BASES</h2>
                    <div class="bps-balance">
                        <span>Your Scrap:</span>
                        <strong id="bps-player-balance">--</strong>
                    </div>
                </div>

                <div class="bps-gallery" id="bps-gallery">
                    <div class="loading">Loading blueprints...</div>
                </div>

                <div class="bps-owned">
                    <h3>📦 My Purchased Blueprints</h3>
                    <div id="bps-owned-list" class="bps-owned-list"></div>
                </div>
            </div>

            <div id="deploy-modal" class="modal hidden">
                <div class="modal-content">
                    <h3>🏗️ Deploy Base</h3>
                    <p>This will build the base at your current in‑game position.</p>
                    <p><strong>Make sure you are standing on flat ground!</strong></p>
                    <div class="modal-actions">
                        <button id="confirm-deploy" class="modal-btn primary">Deploy Now</button>
                        <button id="cancel-deploy" class="modal-btn">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        this.renderGallery();
        this.renderOwned();
        this.fetchBalance();
    }

    async fetchBalance() {
        const playerId = AppState.user.platformId;
        if (!playerId) {
            document.getElementById('bps-player-balance').innerText = '?';
            return;
        }
        try {
            const res = await ConnectionManager.executeCommand(`economy.balance "${playerId}"`);
            const balance = parseInt(res) || 0;
            const el = document.getElementById('bps-player-balance');
            if (el) el.innerText = balance;
        } catch (err) {
            document.getElementById('bps-player-balance').innerText = '?';
        }
    }

    renderGallery() {
        const container = document.getElementById('bps-gallery');
        if (!container) return;
        if (!this.blueprints.length) {
            container.innerHTML = '<div class="no-blueprints">No blueprints available</div>';
            return;
        }

        container.innerHTML = this.blueprints.map(bp => {
            const owned = this.purchases.some(p => p.blueprint_id === bp.id && !p.deployed_at);
            const blockCount = bp.blocks ? bp.blocks.length : 0;
            return `
                <div class="bp-card" data-id="${bp.id}">
                    <div class="bp-icon">🏠</div>
                    <div class="bp-name">${this.escapeHtml(bp.name)}</div>
                    <div class="bp-desc">${this.escapeHtml(bp.description || '')}</div>
                    <div class="bp-specs"><span>📦 ${blockCount} blocks</span><span>💰 ${bp.price} scrap</span></div>
                    <div class="bp-actions">
                        ${owned ? 
                            `<button class="bp-btn deploy-bp" data-id="${bp.id}">🏗️ Deploy</button>` :
                            `<button class="bp-btn primary purchase-bp" data-id="${bp.id}">🛒 Purchase</button>`
                        }
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.purchase-bp').forEach(btn => {
            btn.addEventListener('click', () => this.purchaseBlueprint(parseInt(btn.dataset.id)));
        });
        container.querySelectorAll('.deploy-bp').forEach(btn => {
            btn.addEventListener('click', () => this.openDeployModal(parseInt(btn.dataset.id)));
        });
    }

    renderOwned() {
        const container = document.getElementById('bps-owned-list');
        if (!container) return;
        const owned = this.purchases.filter(p => !p.deployed_at);
        if (owned.length === 0) {
            container.innerHTML = '<div class="no-owned">No purchased blueprints ready to deploy.</div>';
            return;
        }
        container.innerHTML = owned.map(p => {
            const bp = this.blueprints.find(b => b.id === p.blueprint_id);
            return `
                <div class="owned-item">
                    <span>${bp ? bp.name : 'Unknown'}</span>
                    <button class="small-btn deploy-owned" data-id="${p.blueprint_id}">Deploy</button>
                </div>
            `;
        }).join('');
        container.querySelectorAll('.deploy-owned').forEach(btn => {
            btn.addEventListener('click', () => this.openDeployModal(parseInt(btn.dataset.id)));
        });
    }

    async purchaseBlueprint(blueprintId) {
        const bp = this.blueprints.find(b => b.id === blueprintId);
        if (!bp) return;
        if (!confirm(`Purchase "${bp.name}" for ${bp.price} scrap?`)) return;

        const playerId = AppState.user.platformId;
        if (!playerId) {
            toast.error('Platform ID not set. Go to Profile to add your PSN ID / Gamertag.');
            return;
        }

        try {
            const balanceRes = await ConnectionManager.executeCommand(`economy.balance "${playerId}"`);
            const balance = parseInt(balanceRes) || 0;
            if (balance < bp.price) {
                toast.error(`You need ${bp.price} scrap. You have ${balance}.`);
                return;
            }
        } catch (err) {
            toast.error('Could not verify balance');
            return;
        }

        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/drained/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId, blueprintId: bp.id, price: bp.price })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Purchase failed');
            toast.success(`Blueprint "${bp.name}" purchased!`);
            await this.loadMyPurchases();
            this.renderGallery();
            this.renderOwned();
            this.fetchBalance();
        } catch (err) {
            toast.error(err.message);
        }
    }

    openDeployModal(blueprintId) {
        this.deployingId = blueprintId;
        document.getElementById('deploy-modal').classList.remove('hidden');
    }

    async deployBlueprint() {
        const blueprintId = this.deployingId;
        if (!blueprintId) return;
        const bp = this.blueprints.find(b => b.id === blueprintId);
        if (!bp) {
            toast.error('Blueprint not found');
            return;
        }

        const playerName = AppState.user.username;
        if (!playerName) {
            toast.error('Player name not found');
            return;
        }

        let position = null;
        try {
            const posRaw = await ConnectionManager.executeCommand(`player.position "${playerName}"`);
            const match = posRaw.match(/X:\s*([-\d.]+),\s*Y:\s*([-\d.]+),\s*Z:\s*([-\d.]+)/i);
            if (match) {
                position = {
                    x: parseFloat(match[1]),
                    y: parseFloat(match[2]),
                    z: parseFloat(match[3])
                };
            } else {
                throw new Error('Could not parse position');
            }
        } catch (err) {
            toast.error(`Failed to get your position: ${err.message}`);
            document.getElementById('deploy-modal').classList.add('hidden');
            return;
        }

        // Offset the entire base slightly forward (z+2) so it doesn't spawn inside the player
        const offsetX = 2;
        const offsetZ = 2;
        let successCount = 0;
        for (const block of bp.blocks) {
            const cmd = `spawn ${block.shortname} ${position.x + block.x + offsetX} ${position.y + block.y + 0.5} ${position.z + block.z + offsetZ}`;
            try {
                await ConnectionManager.executeCommand(cmd);
                successCount++;
                await new Promise(r => setTimeout(r, 150));
            } catch (err) {
                console.error(`Failed to spawn ${block.shortname}:`, err);
            }
        }

        if (successCount > 0) {
            try {
                await fetch(`${AppState.connection.bridgeUrl}/api/drained/deploy`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ playerId: AppState.user.platformId, blueprintId })
                });
            } catch (err) {
                console.warn('Failed to mark deployment on server', err);
            }
            await this.loadMyPurchases();
            this.renderGallery();
            this.renderOwned();
            toast.success(`Base deployed! ${successCount}/${bp.blocks.length} blocks placed.`);
        } else {
            toast.error('Failed to deploy base. Check logs.');
        }

        document.getElementById('deploy-modal').classList.add('hidden');
        this.deployingId = null;
    }

    attachEvents() {
        document.getElementById('confirm-deploy')?.addEventListener('click', () => this.deployBlueprint());
        document.getElementById('cancel-deploy')?.addEventListener('click', () => {
            document.getElementById('deploy-modal').classList.add('hidden');
            this.deployingId = null;
        });
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    async refresh() {
        await this.loadBlueprints();
        await this.loadMyPurchases();
        this.renderGallery();
        this.renderOwned();
        this.fetchBalance();
        toast.success('Blueprints refreshed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.drainedBases = new DrainedBases();
});