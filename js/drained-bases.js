// drained-bases.js – DRAINED TABLET ULTIMATE v7.0.0
// Shop‑style blueprint system with player name dropdown.

class DrainedBases {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
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
        window.addEventListener('players-updated', () => this.updatePlayerDropdown());
    }

    getDefaultBlueprints() {
        return [
            { 
                id: 1, 
                name: "2x1 Starter", 
                description: "Compact starter base with airlock, TC, and sleeping bag.", 
                price: 250, 
                blocks: 5, 
                shortname: "2x1_starter", 
                image: "https://www.corrosionhour.com/img/items/wood.png",
                blockData: [
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
                blocks: 9, 
                shortname: "2x2_medium", 
                image: "https://www.corrosionhour.com/img/items/metal.fragments.png",
                blockData: [
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
                blocks: 16, 
                shortname: "3x3_fortress", 
                image: "https://www.corrosionhour.com/img/items/hq.metal.ore.png",
                blockData: [
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
            if (!res.ok) throw new Error();
            this.blueprints = await res.json();
            if (!this.blueprints || this.blueprints.length === 0) {
                this.blueprints = this.getDefaultBlueprints();
            } else {
                // Ensure blockData is present
                this.blueprints = this.blueprints.map(bp => {
                    const defaultBp = this.getDefaultBlueprints().find(d => d.id === bp.id);
                    if (defaultBp && (!bp.blockData || bp.blockData.length === 0)) bp.blockData = defaultBp.blockData;
                    return bp;
                });
            }
        } catch (err) {
            this.blueprints = this.getDefaultBlueprints();
        }
    }

    async loadMyPurchases() {
        const playerId = AppState.user.platformId;
        if (!playerId) {
            if (window.accessControl && window.accessControl.isMasterUser()) {
                const masterPurchases = localStorage.getItem('tdl_master_purchases');
                this.purchases = masterPurchases ? JSON.parse(masterPurchases) : [];
                return;
            }
            this.purchases = [];
            return;
        }
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/drained/purchases/${encodeURIComponent(playerId)}`);
            if (!res.ok) throw new Error();
            this.purchases = await res.json();
        } catch (err) { 
            this.purchases = [];
        }
    }

    saveMasterPurchases() {
        if (window.accessControl && window.accessControl.isMasterUser()) {
            localStorage.setItem('tdl_master_purchases', JSON.stringify(this.purchases));
        }
    }

    createHTML() {
        const tab = document.getElementById('tab-drained-bases');
        if (!tab) return;
        tab.innerHTML = `
            <div class="bps-container">
                <div class="bps-header">
                    <h2>🏕️ DRAINED LAND'S BASES</h2>
                    <div class="bps-balance">💰 Your Scrap: <strong id="bps-player-balance">--</strong></div>
                </div>
                <div class="bps-gallery" id="bps-gallery"><div class="loading">Loading blueprints...</div></div>
                <div class="bps-owned"><h3>📦 My Purchased Blueprints</h3><div id="bps-owned-list" class="bps-owned-list"></div></div>
            </div>
            <div id="deploy-modal" class="modal hidden">
                <div class="modal-content">
                    <h3>🏗️ Deploy Base</h3>
                    <div class="bp-player-select"><label>Select Player (online):</label><select id="deploy-player-select"></select></div>
                    <p>Base will be built at this player's current position.</p>
                    <p><strong>Make sure they are standing on flat ground!</strong></p>
                    <div class="modal-actions"><button id="confirm-deploy" class="modal-btn primary">Deploy Now</button><button id="cancel-deploy" class="modal-btn">Cancel</button></div>
                </div>
            </div>
        `;
        this.renderGallery();
        this.renderOwned();
        this.fetchBalance();
        this.updatePlayerDropdown();
    }

    async fetchBalance() {
        const isMaster = window.accessControl && window.accessControl.isMasterUser();
        if (isMaster) {
            document.getElementById('bps-player-balance').innerText = '∞ (MASTER)';
            return;
        }
        const playerId = AppState.user.platformId;
        if (!playerId) { 
            document.getElementById('bps-player-balance').innerText = '? (Set Platform ID)';
            return;
        }
        try {
            const res = await ConnectionManager.executeCommand(`economy.balance "${playerId}"`);
            document.getElementById('bps-player-balance').innerText = parseInt(res) || 0;
        } catch { 
            document.getElementById('bps-player-balance').innerText = '?';
        }
    }

    updatePlayerDropdown() {
    const select = document.getElementById('deploy-player-select');
    if (!select) return;
    const players = AppState.players || [];
    let options = '<option value="">Select a player...</option>';
    if (players.length === 0) {
        options = '<option value="">No players online</option>';
    } else {
        players.forEach(p => {
            // Try common name properties in order
            let name = p.DisplayName || p.displayName || p.name || p.playerName || p.username;
            // If still undefined, see if there's a property that looks like a name
            if (!name && typeof p === 'object') {
                const possible = Object.values(p).find(v => typeof v === 'string' && v.length > 0 && v.length < 50 && !v.includes('STEAM'));
                if (possible) name = possible;
            }
            if (name) {
                name = name.replace(/[<>]/g, ''); // sanitize
                options += `<option value="${name}">${name}</option>`;
            } else {
                console.warn('No name found for player:', p);
            }
        });
    }
    select.innerHTML = options;
}

    renderGallery() {
        const container = document.getElementById('bps-gallery');
        if (!container) return;
        if (!this.blueprints.length) { container.innerHTML = '<div class="no-blueprints">No blueprints available</div>'; return; }
        const isMaster = window.accessControl && window.accessControl.isMasterUser();
        container.innerHTML = this.blueprints.map(bp => {
            const owned = this.purchases.some(p => p.blueprint_id === bp.id && !p.deployed_at);
            const priceDisplay = isMaster ? 'FREE (Master)' : `${bp.price} scrap`;
            const blockCount = (bp.blockData && bp.blockData.length) ? bp.blockData.length : (bp.blocks || 0);
            return `
                <div class="bp-card" data-id="${bp.id}">
                    <img src="${this.getItemImage(bp.image || bp.shortname)}" class="bp-image" onerror="this.src='https://www.corrosionhour.com/img/items/wood.png'">
                    <div class="bp-name">${this.escapeHtml(bp.name)}</div>
                    <div class="bp-desc">${this.escapeHtml(bp.description || '')}</div>
                    <div class="bp-specs"><span>📦 ${blockCount} blocks</span><span>💰 ${priceDisplay}</span></div>
                    <div class="bp-actions">
                        ${owned ? `<button class="bp-btn deploy-bp" data-id="${bp.id}">🏗️ Deploy</button>` : `<button class="bp-btn primary purchase-bp" data-id="${bp.id}">🛒 Purchase</button>`}
                    </div>
                </div>
            `;
        }).join('');
        container.querySelectorAll('.purchase-bp').forEach(btn => btn.addEventListener('click', () => this.purchaseBlueprint(parseInt(btn.dataset.id))));
        container.querySelectorAll('.deploy-bp').forEach(btn => btn.addEventListener('click', () => this.openDeployModal(parseInt(btn.dataset.id))));
    }

    getItemImage(identifier) {
        if (identifier && identifier.startsWith('http')) return identifier;
        const shortname = (identifier || 'wood').replace(/_/g, '-');
        return `https://www.corrosionhour.com/img/items/${shortname}.png`;
    }

    renderOwned() {
        const container = document.getElementById('bps-owned-list');
        if (!container) return;
        const owned = this.purchases.filter(p => !p.deployed_at);
        if (owned.length === 0) { container.innerHTML = '<div class="no-owned">No purchased blueprints ready to deploy.</div>'; return; }
        container.innerHTML = owned.map(p => {
            const bp = this.blueprints.find(b => b.id === p.blueprint_id);
            return `<div class="owned-item"><span>${bp ? bp.name : 'Unknown'}</span><button class="small-btn deploy-owned" data-id="${p.blueprint_id}">Deploy</button></div>`;
        }).join('');
        container.querySelectorAll('.deploy-owned').forEach(btn => btn.addEventListener('click', () => this.openDeployModal(parseInt(btn.dataset.id))));
    }

    async purchaseBlueprint(blueprintId) {
        const bp = this.blueprints.find(b => b.id === blueprintId);
        if (!bp) return;
        
        const isMaster = window.accessControl && window.accessControl.isMasterUser();
        
        if (isMaster) {
            if (!confirm(`Purchase "${bp.name}" for FREE as Master?`)) return;
            const purchaseRecord = { blueprint_id: bp.id, deployed_at: null, purchased_at: new Date().toISOString() };
            this.purchases.push(purchaseRecord);
            this.saveMasterPurchases();
            toast.success(`Blueprint "${bp.name}" purchased for free (Master)`);
            this.renderGallery();
            this.renderOwned();
            return;
        }
        
        const playerId = AppState.user.platformId;
        if (!playerId) {
            toast.error('Platform ID not set. Go to Profile to add your PSN ID / Gamertag.');
            return;
        }
        
        if (!confirm(`Purchase "${bp.name}" for ${bp.price} scrap?`)) return;
        
        try {
            const balanceRes = await ConnectionManager.executeCommand(`economy.balance "${playerId}"`);
            const balance = parseInt(balanceRes) || 0;
            if (balance < bp.price) { toast.error(`You need ${bp.price} scrap. You have ${balance}.`); return; }
        } catch { toast.error('Could not verify balance'); return; }
        
        try {
            await ConnectionManager.executeCommand(`economy.remove "${playerId}" ${bp.price}`);
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/drained/purchase`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId, blueprintId: bp.id, price: bp.price })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Purchase failed');
            toast.success(`Blueprint "${bp.name}" purchased!`);
            await this.loadMyPurchases();
            this.renderGallery(); this.renderOwned(); this.fetchBalance();
        } catch (err) { toast.error(err.message); }
    }

    openDeployModal(blueprintId) {
        this.deployingId = blueprintId;
        this.updatePlayerDropdown();
        document.getElementById('deploy-modal').classList.remove('hidden');
    }

    async deployBlueprint() {
        const blueprintId = this.deployingId;
        if (!blueprintId) return;
        const bp = this.blueprints.find(b => b.id === blueprintId);
        if (!bp || !bp.blockData) { toast.error('Blueprint data missing'); return; }
        
        const select = document.getElementById('deploy-player-select');
        const targetPlayer = select.value;
        if (!targetPlayer) { toast.error('Select a player'); return; }
        
        let position = null;
        try {
            const posRaw = await ConnectionManager.executeCommand(`player.position "${targetPlayer}"`);
            const match = posRaw.match(/X:\s*([-\d.]+),\s*Y:\s*([-\d.]+),\s*Z:\s*([-\d.]+)/i);
            if (match) position = { x: parseFloat(match[1]), y: parseFloat(match[2]), z: parseFloat(match[3]) };
            else throw new Error('Could not parse position');
        } catch (err) { toast.error(`Failed to get player position: ${err.message}`); document.getElementById('deploy-modal').classList.add('hidden'); return; }
        
        const offsetX = 2, offsetZ = 2;
        let successCount = 0;
        for (const block of bp.blockData) {
            const cmd = `spawn ${block.shortname} ${position.x + block.x + offsetX} ${position.y + block.y + 0.5} ${position.z + block.z + offsetZ}`;
            try {
                await ConnectionManager.executeCommand(cmd);
                successCount++;
                await new Promise(r => setTimeout(r, 150));
            } catch (err) { console.error(err); }
        }
        
        if (successCount > 0) {
            if (window.accessControl && window.accessControl.isMasterUser()) {
                const purchase = this.purchases.find(p => p.blueprint_id === blueprintId && !p.deployed_at);
                if (purchase) purchase.deployed_at = new Date().toISOString();
                this.saveMasterPurchases();
            } else {
                try {
                    await fetch(`${AppState.connection.bridgeUrl}/api/drained/deploy`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ playerId: AppState.user.platformId, blueprintId })
                    });
                } catch (err) { console.warn(err); }
                await this.loadMyPurchases();
            }
            this.renderGallery(); this.renderOwned();
            toast.success(`Base deployed for ${targetPlayer}! ${successCount}/${bp.blockData.length} blocks placed.`);
        } else { toast.error('Failed to deploy base. Check logs.'); }
        
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

    escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'); }

    async refresh() {
        await this.loadBlueprints(); await this.loadMyPurchases();
        this.renderGallery(); this.renderOwned(); this.fetchBalance(); this.updatePlayerDropdown();
        toast.success('Blueprints refreshed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.drainedBases = new DrainedBases();
});