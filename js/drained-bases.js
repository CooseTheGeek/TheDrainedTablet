// drained-bases.js – DRAINED TABLET v7.0.0 (Admin can edit images, prices, etc.)

class DrainedBases {
    constructor() {
        this.access = window.accessControl;
        this.blueprints = [];
        this.purchases = [];
        this.editingId = null;
        this.init();
    }

    getDefaultBlueprints() {
        const defaultImg = "https://www.corrosionhour.com/img/items/wood.png";
        return [
            { id: 1, name: "2x1 Starter", description: "2x1 with TC, sleeping bag, key lock, and sheet metal door.", price: 350, materials: { wood: 300, stone: 0, metal: 100, hqm: 0 }, items: [{ shortname: "cupboard.tool", amount: 1 }, { shortname: "sleepingbag", amount: 1 }, { shortname: "lock.key", amount: 1 }, { shortname: "door.hinged.metal", amount: 1 }], image: "https://www.corrosionhour.com/img/items/wood.png" },
            { id: 2, name: "2x2 Medium", description: "2x2 with TC, sleeping bag, lock, metal door.", price: 600, materials: { wood: 600, stone: 900, metal: 200, hqm: 0 }, items: [{ shortname: "cupboard.tool", amount: 1 }, { shortname: "sleepingbag", amount: 1 }, { shortname: "lock.key", amount: 1 }, { shortname: "door.hinged.metal", amount: 1 }], image: "https://www.corrosionhour.com/img/items/metal.fragments.png" },
            { id: 3, name: "3x3 Fortress", description: "Large 3x3 base with TC, bag, lock, metal door.", price: 1200, materials: { wood: 1200, stone: 1800, metal: 800, hqm: 50 }, items: [{ shortname: "cupboard.tool", amount: 1 }, { shortname: "sleepingbag", amount: 1 }, { shortname: "lock.key", amount: 1 }, { shortname: "door.hinged.metal", amount: 1 }], image: "https://www.corrosionhour.com/img/items/hq.metal.ore.png" }
        ];
    }

    async init() {
        await this.loadBlueprints();
        await this.loadMyPurchases();
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => { if (e.detail.tab === 'drained-bases') this.refresh(); });
    }

    async loadBlueprints() {
        const saved = localStorage.getItem('tdl_drained_blueprints');
        if (saved) { this.blueprints = JSON.parse(saved); }
        else { this.blueprints = this.getDefaultBlueprints(); this.saveBlueprints(); }
    }
    saveBlueprints() { localStorage.setItem('tdl_drained_blueprints', JSON.stringify(this.blueprints)); }
    async loadMyPurchases() { const playerId = AppState.user?.platformId; if(!playerId && !this.access.isMasterUser()) { this.purchases = []; return; } const saved = localStorage.getItem('tdl_master_purchases'); this.purchases = saved ? JSON.parse(saved) : []; }
    saveMasterPurchases() { if(this.access.isMasterUser()) localStorage.setItem('tdl_master_purchases', JSON.stringify(this.purchases)); }

    createHTML() {
        const tab = document.getElementById('tab-drained-bases');
        if(!tab) return;
        const isAdmin = this.access.isMasterUser();
        tab.innerHTML = `
            <div class="bps-container">
                <div class="bps-header"><h2>🏕️ DRAINED LAND'S BASES</h2><div class="bps-balance">💰 Your Scrap: <strong id="bps-player-balance">--</strong></div>${isAdmin ? '<button id="add-blueprint" class="bps-btn primary">+ ADD BASE</button>' : ''}</div>
                <div class="bps-gallery" id="bps-gallery"></div>
                <div class="bps-owned"><h3>📦 My Purchased Blueprints</h3><div id="bps-owned-list"></div></div>
            </div>
            <div id="bp-modal" class="modal hidden"><div class="modal-content"><h3 id="bp-modal-title">Add/Edit Base</h3>
            <div class="form-group"><label>Name</label><input type="text" id="bp-name"></div>
            <div class="form-group"><label>Description</label><textarea id="bp-desc"></textarea></div>
            <div class="form-group"><label>Price (scrap)</label><input type="number" id="bp-price"></div>
            <div class="form-group"><label>Image URL</label><input type="text" id="bp-image"></div>
            <h4>Materials</h4><div class="form-row"><label>Wood</label><input type="number" id="bp-wood"><label>Stone</label><input type="number" id="bp-stone"><label>Metal</label><input type="number" id="bp-metal"><label>HQM</label><input type="number" id="bp-hqm"></div>
            <h4>Extra Items</h4><div id="bp-items-list"></div><button id="add-bp-item" class="small-btn">+ Add Item</button>
            <div class="modal-actions"><button id="bp-save" class="modal-btn primary">Save</button><button id="bp-cancel" class="modal-btn">Cancel</button></div>
            </div></div>
        `;
        this.renderGallery();
        this.renderOwned();
        this.fetchBalance();
        if(isAdmin) this.attachAdminEvents();
    }

    attachAdminEvents() {
        document.getElementById('add-blueprint')?.addEventListener('click', () => this.openBlueprintModal());
        document.getElementById('bp-save')?.addEventListener('click', () => this.saveBlueprint());
        document.getElementById('bp-cancel')?.addEventListener('click', () => document.getElementById('bp-modal').classList.add('hidden'));
        document.getElementById('add-bp-item')?.addEventListener('click', () => this.addBlueprintItemField());
    }

    addBlueprintItemField() { const container = document.getElementById('bp-items-list'); const idx = container.children.length; const div = document.createElement('div'); div.className = 'form-row'; div.innerHTML = `<input type="text" placeholder="shortname" id="bp-item-short-${idx}" value=""><input type="number" placeholder="amount" id="bp-item-amt-${idx}" value="1"><button class="small-btn remove-bp-item" data-idx="${idx}">✕</button>`; container.appendChild(div); div.querySelector('.remove-bp-item').addEventListener('click', () => div.remove()); }

    openBlueprintModal(id = null) {
        this.editingId = id;
        document.getElementById('bp-modal-title').innerText = id ? 'Edit Base' : 'Add Base';
        document.getElementById('bp-name').value = '';
        document.getElementById('bp-desc').value = '';
        document.getElementById('bp-price').value = '0';
        document.getElementById('bp-image').value = '';
        document.getElementById('bp-wood').value = '0';
        document.getElementById('bp-stone').value = '0';
        document.getElementById('bp-metal').value = '0';
        document.getElementById('bp-hqm').value = '0';
        document.getElementById('bp-items-list').innerHTML = '';
        if(id){
            const bp = this.blueprints.find(b=>b.id===id);
            if(bp){
                document.getElementById('bp-name').value = bp.name;
                document.getElementById('bp-desc').value = bp.description||'';
                document.getElementById('bp-price').value = bp.price;
                document.getElementById('bp-image').value = bp.image||'';
                document.getElementById('bp-wood').value = bp.materials.wood||0;
                document.getElementById('bp-stone').value = bp.materials.stone||0;
                document.getElementById('bp-metal').value = bp.materials.metal||0;
                document.getElementById('bp-hqm').value = bp.materials.hqm||0;
                if(bp.items) bp.items.forEach((item,i)=>{
                    const div = document.createElement('div'); div.className='form-row'; div.innerHTML=`<input type="text" placeholder="shortname" id="bp-item-short-${i}" value="${item.shortname}"><input type="number" placeholder="amount" id="bp-item-amt-${i}" value="${item.amount}"><button class="small-btn remove-bp-item" data-idx="${i}">✕</button>`; document.getElementById('bp-items-list').appendChild(div); div.querySelector('.remove-bp-item').addEventListener('click',()=>div.remove());
                });
            }
        }
        document.getElementById('bp-modal').classList.remove('hidden');
    }

    saveBlueprint() {
        const name = document.getElementById('bp-name').value.trim();
        if(!name){ toast.error('Name required'); return; }
        const materials = {
            wood: parseInt(document.getElementById('bp-wood').value)||0,
            stone: parseInt(document.getElementById('bp-stone').value)||0,
            metal: parseInt(document.getElementById('bp-metal').value)||0,
            hqm: parseInt(document.getElementById('bp-hqm').value)||0
        };
        const items = [];
        const itemRows = document.querySelectorAll('#bp-items-list .form-row');
        itemRows.forEach(row=>{
            const short = row.querySelector('input[type="text"]')?.value;
            const amt = parseInt(row.querySelector('input[type="number"]')?.value);
            if(short && amt>0) items.push({ shortname: short, amount: amt });
        });
        const bp = {
            id: this.editingId || Date.now(),
            name: name,
            description: document.getElementById('bp-desc').value,
            price: parseInt(document.getElementById('bp-price').value)||0,
            materials: materials,
            items: items,
            image: document.getElementById('bp-image').value || null
        };
        if(this.editingId){
            const idx = this.blueprints.findIndex(b=>b.id===this.editingId);
            if(idx!==-1) this.blueprints[idx]=bp;
        } else { this.blueprints.push(bp); }
        this.saveBlueprints();
        this.renderGallery();
        document.getElementById('bp-modal').classList.add('hidden');
        toast.success('Blueprint saved');
    }

    async fetchBalance() { const playerId = AppState.user?.platformId; if(!playerId && !this.access.isMasterUser()){ document.getElementById('bps-player-balance').innerText='?'; return; } try{ const bal = await ConnectionManager.executeCommand(`economy.balance "${playerId}"`); document.getElementById('bps-player-balance').innerText=parseInt(bal)||0; } catch(e){ document.getElementById('bps-player-balance').innerText='?'; } }

    renderGallery() {
        const container = document.getElementById('bps-gallery');
        if(!container) return;
        const isAdmin = this.access.isMasterUser();
        const defaultImg = "https://www.corrosionhour.com/img/items/wood.png";
        container.innerHTML = this.blueprints.map(bp => `
            <div class="bp-card">
                <img src="${bp.image||defaultImg}" class="bp-image" style="width:100px; height:100px; object-fit:contain;" onerror="this.src='${defaultImg}'">
                <div class="bp-name">${this.escapeHtml(bp.name)}</div>
                <div class="bp-desc">${this.escapeHtml(bp.description||'')}</div>
                <div class="bp-price">💰 ${bp.price} scrap</div>
                <div class="bp-actions">
                    <button class="bp-btn primary purchase-bp" data-id="${bp.id}">🛒 Purchase</button>
                    ${isAdmin ? `<button class="bp-btn edit-bp" data-id="${bp.id}">✏️</button><button class="bp-btn delete-bp" data-id="${bp.id}">🗑️</button>` : ''}
                </div>
            </div>
        `).join('');
        container.querySelectorAll('.purchase-bp').forEach(btn=>btn.addEventListener('click',()=>this.purchaseBlueprint(parseInt(btn.dataset.id))));
        if(isAdmin){
            container.querySelectorAll('.edit-bp').forEach(btn=>btn.addEventListener('click',()=>this.openBlueprintModal(parseInt(btn.dataset.id))));
            container.querySelectorAll('.delete-bp').forEach(btn=>btn.addEventListener('click',()=>this.deleteBlueprint(parseInt(btn.dataset.id))));
        }
    }

    renderOwned() {
        const container = document.getElementById('bps-owned-list');
        const owned = this.purchases.filter(p=>!p.deployed_at);
        if(!owned.length){ container.innerHTML='<div class="no-owned">No bases ready to claim</div>'; return; }
        container.innerHTML = owned.map(p=>{
            const bp = this.blueprints.find(b=>b.id===p.blueprint_id);
            return `<div class="owned-item"><span>${bp?bp.name:'Unknown'}</span><button class="small-btn claim-kit" data-id="${p.blueprint_id}">Claim Kit</button></div>`;
        }).join('');
        container.querySelectorAll('.claim-kit').forEach(btn=>btn.addEventListener('click',()=>this.claimKit(parseInt(btn.dataset.id))));
    }

    async purchaseBlueprint(blueprintId){
        const bp = this.blueprints.find(b=>b.id===blueprintId);
        if(!bp) return;
        const playerId = AppState.user?.platformId;
        if(!playerId && !this.access.isMasterUser()){ toast.error('Platform ID not set'); return; }
        if(this.access.isMasterUser()){
            if(!confirm(`Purchase "${bp.name}" for free?`)) return;
            this.purchases.push({ blueprint_id: bp.id, deployed_at: null, purchased_at: new Date().toISOString() });
            this.saveMasterPurchases();
            this.renderOwned();
            toast.success(`Blueprint "${bp.name}" added to your kits (Master)`);
            return;
        }
        try{
            const bal = await ConnectionManager.executeCommand(`economy.balance "${playerId}"`);
            if(parseInt(bal)<bp.price){ toast.error(`Need ${bp.price} scrap`); return; }
            await ConnectionManager.executeCommand(`economy.remove "${playerId}" ${bp.price}`);
            this.purchases.push({ blueprint_id: bp.id, deployed_at: null, purchased_at: new Date().toISOString() });
            this.saveMasterPurchases();
            toast.success(`Blueprint "${bp.name}" purchased!`);
            this.renderOwned();
            this.fetchBalance();
        } catch(err){ toast.error(err.message); }
    }

    async claimKit(blueprintId){
        const bp = this.blueprints.find(b=>b.id===blueprintId);
        if(!bp) return;
        const playerId = AppState.user?.platformId || (this.access.isMasterUser() ? 'master' : null);
        if(!playerId){ toast.error('No player ID'); return; }
        if(bp.materials.wood>0) await ConnectionManager.executeCommand(`inventory.give "${playerId}" wood ${bp.materials.wood}`);
        if(bp.materials.stone>0) await ConnectionManager.executeCommand(`inventory.give "${playerId}" stones ${bp.materials.stone}`);
        if(bp.materials.metal>0) await ConnectionManager.executeCommand(`inventory.give "${playerId}" metal.fragments ${bp.materials.metal}`);
        if(bp.materials.hqm>0) await ConnectionManager.executeCommand(`inventory.give "${playerId}" metal.refined ${bp.materials.hqm}`);
        if(bp.items) for(const item of bp.items) await ConnectionManager.executeCommand(`inventory.give "${playerId}" ${item.shortname} ${item.amount}`);
        const purchase = this.purchases.find(p=>p.blueprint_id===blueprintId && !p.deployed_at);
        if(purchase) purchase.deployed_at = new Date().toISOString();
        this.saveMasterPurchases();
        this.renderOwned();
        toast.success(`Materials and items for "${bp.name}" added to your inventory!`);
    }

    deleteBlueprint(id){ if(confirm('Delete this blueprint?')){ this.blueprints = this.blueprints.filter(b=>b.id!==id); this.saveBlueprints(); this.renderGallery(); toast.info('Blueprint deleted'); } }
    escapeHtml(str){ if(!str) return ''; return str.replace(/[&<>]/g,m=>m==='&'?'&amp;':m==='<'?'&lt;':'&gt;'); }
    refresh(){ this.renderGallery(); this.renderOwned(); this.fetchBalance(); toast.success('Base blueprints refreshed'); }
}
document.addEventListener('DOMContentLoaded',()=>{ window.drainedBases = new DrainedBases(); });