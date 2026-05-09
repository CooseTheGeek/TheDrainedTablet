// shop.js – DRAINED TABLET ULTIMATE v7.0.0
// Complete shop system with admin panel, product management, and player purchase.

class Shop {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.items = [];
        this.categories = ['Weapons', 'Ammo', 'Armor', 'Medical', 'Resources', 'Tools', 'Misc', 'Construction', 'Electrical', 'Traps', 'Components'];
        this.editingId = null;
        this.init();
    }

    async init() {
        await this.loadItems();
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'shop') this.refresh();
        });
    }

    async loadItems() {
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/shop/items`);
            if (!res.ok) throw new Error('Failed to load shop items');
            this.items = await res.json();
        } catch (err) {
            console.error('Shop load error:', err);
            this.items = [];
        }
        this.renderProducts();
    }

    getUserPlatformId() {
        return AppState.user.platformId || localStorage.getItem('tdl_platform_id');
    }

    async getPlayerBalance() {
        const playerId = this.getUserPlatformId();
        if (!playerId) return null;
        try {
            const res = await ConnectionManager.executeCommand(`economy.balance "${playerId}"`);
            return parseInt(res) || 0;
        } catch {
            return null;
        }
    }

    createHTML() {
        const tab = document.getElementById('tab-shop');
        if (!tab) return;

        const isAdmin = this.access.hasRole('master') || this.access.hasRole('owner');

        tab.innerHTML = `
            <div class="shop-container" style="padding:1rem;">
                <div class="shop-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                    <h2 style="color:var(--accent-primary);">🏪 SERVER SHOP</h2>
                    <div class="shop-balance" style="background:var(--bg-tertiary); padding:0.5rem 1rem; border-radius:30px;">
                        💰 Your Scrap: <strong id="shop-player-balance">--</strong>
                    </div>
                    ${isAdmin ? '<button id="shop-add-product" class="shop-btn primary" style="padding:0.8rem 1.5rem;">+ ADD PRODUCT</button>' : ''}
                </div>

                <div style="display:flex; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap;">
                    <input type="text" id="shop-search" placeholder="Search items..." style="flex:2; min-width:200px; padding:0.8rem 1rem; background:var(--bg-tertiary); border:1px solid var(--glass-border); border-radius:30px;">
                    <select id="shop-category-filter" style="flex:1; min-width:150px; padding:0.8rem 1rem; background:var(--bg-tertiary); border:1px solid var(--glass-border); border-radius:30px;">
                        <option value="all">All Categories</option>
                        ${this.categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>

                <div id="shop-products" class="products-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px,1fr)); gap:1.5rem; margin-bottom:2rem;"></div>

                <!-- Admin Product Modal (Create/Edit) -->
                <div id="shop-product-modal" class="modal hidden">
                    <div class="modal-content" style="max-width:700px; width:90%;">
                        <h3 id="shop-modal-title" style="color:var(--accent-primary); margin-bottom:1rem;">Create Product</h3>
                        
                        <div class="shop-tabs" style="display:flex; gap:0.5rem; border-bottom:1px solid var(--glass-border); margin-bottom:1.5rem;">
                            <button class="shop-tab active" data-tab="info" style="padding:0.5rem 1rem; background:none; border:none; color:var(--text-secondary); cursor:pointer; border-bottom:2px solid transparent;">📝 Product Info</button>
                            <button class="shop-tab" data-tab="commands" style="padding:0.5rem 1rem; background:none; border:none; color:var(--text-secondary); cursor:pointer; border-bottom:2px solid transparent;">⚡ Commands</button>
                        </div>

                        <!-- Info Tab -->
                        <div id="shop-info-tab" class="shop-tab-content">
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label style="display:block; margin-bottom:0.3rem; color:var(--text-secondary);">Product Name *</label>
                                <input type="text" id="product-name" placeholder="e.g., Hazmat Suit" style="width:100%; padding:0.8rem; background:var(--bg-tertiary); border:1px solid var(--glass-border); border-radius:8px;">
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label style="display:block; margin-bottom:0.3rem; color:var(--text-secondary);">Description</label>
                                <textarea id="product-desc" rows="3" placeholder="Enter product description" style="width:100%; padding:0.8rem; background:var(--bg-tertiary); border:1px solid var(--glass-border); border-radius:8px;"></textarea>
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label style="display:block; margin-bottom:0.3rem; color:var(--text-secondary);">Category *</label>
                                <select id="product-category" style="width:100%; padding:0.8rem; background:var(--bg-tertiary); border:1px solid var(--glass-border); border-radius:8px;">
                                    <option value="">Select a category</option>
                                    ${this.categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label style="display:block; margin-bottom:0.3rem; color:var(--text-secondary);">Product Image</label>
                                <input type="file" id="product-image" accept="image/*" style="width:100%; padding:0.5rem; background:var(--bg-tertiary); border:1px solid var(--glass-border); border-radius:8px;">
                                <div id="product-image-preview" style="margin-top:0.5rem; display:flex; justify-content:center;"></div>
                            </div>
                        </div>

                        <!-- Commands Tab -->
                        <div id="shop-commands-tab" class="shop-tab-content" style="display:none;">
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label style="display:block; margin-bottom:0.3rem; color:var(--text-secondary);">Item Shortname *</label>
                                <input type="text" id="product-shortname" placeholder="e.g., hazmatsuit" style="width:100%; padding:0.8rem; background:var(--bg-tertiary); border:1px solid var(--glass-border); border-radius:8px;">
                                <small style="color:var(--text-secondary);">Use item shortname from items database</small>
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label style="display:block; margin-bottom:0.3rem; color:var(--text-secondary);">Quantity</label>
                                <input type="number" id="product-quantity" value="1" min="1" style="width:100%; padding:0.8rem; background:var(--bg-tertiary); border:1px solid var(--glass-border); border-radius:8px;">
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label style="display:block; margin-bottom:0.3rem; color:var(--text-secondary);">Price (Scrap) *</label>
                                <input type="number" id="product-price" value="0" min="0" style="width:100%; padding:0.8rem; background:var(--bg-tertiary); border:1px solid var(--glass-border); border-radius:8px;">
                            </div>
                            <div class="form-group" style="margin-bottom:1rem;">
                                <label style="display:block; margin-bottom:0.3rem; color:var(--text-secondary);">Stock (-1 = unlimited)</label>
                                <input type="number" id="product-stock" value="-1" min="-1" style="width:100%; padding:0.8rem; background:var(--bg-tertiary); border:1px solid var(--glass-border); border-radius:8px;">
                            </div>
                            <div class="checkbox-item" style="margin-bottom:1rem;">
                                <label style="display:flex; align-items:center; gap:0.5rem;">
                                    <input type="checkbox" id="product-use-command"> Override command (instead of default give)
                                </label>
                            </div>
                            <div class="form-group" id="command-override-group" style="display:none; margin-bottom:1rem;">
                                <label style="display:block; margin-bottom:0.3rem; color:var(--text-secondary);">Custom Command</label>
                                <input type="text" id="product-command" placeholder="e.g., spawn.supplydrop $x $y $z" style="width:100%; padding:0.8rem; background:var(--bg-tertiary); border:1px solid var(--glass-border); border-radius:8px;">
                                <small style="color:var(--text-secondary);">Use $player for player name, $x $y $z for coordinates</small>
                            </div>
                        </div>

                        <div class="modal-actions" style="display:flex; gap:1rem; justify-content:flex-end; margin-top:1.5rem;">
                            <button id="shop-save-product" class="modal-btn primary" style="padding:0.8rem 2rem;">Save Product</button>
                            <button id="shop-cancel-product" class="modal-btn" style="padding:0.8rem 2rem;">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.updateBalance();
        this.renderProducts();
        this.attachModalEvents();
    }

    attachEvents() {
        const isAdmin = this.access.hasRole('master') || this.access.hasRole('owner');
        document.getElementById('shop-search')?.addEventListener('input', () => this.renderProducts());
        document.getElementById('shop-category-filter')?.addEventListener('change', () => this.renderProducts());
        if (isAdmin) {
            document.getElementById('shop-add-product')?.addEventListener('click', () => this.openProductModal());
            document.getElementById('shop-save-product')?.addEventListener('click', () => this.saveProduct());
            document.getElementById('shop-cancel-product')?.addEventListener('click', () => {
                document.getElementById('shop-product-modal').classList.add('hidden');
            });
            // Tab switching inside modal
            document.querySelectorAll('.shop-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.shop-tab-content').forEach(c => c.style.display = 'none');
                    e.target.classList.add('active');
                    const tabId = e.target.dataset.tab === 'info' ? 'shop-info-tab' : 'shop-commands-tab';
                    document.getElementById(tabId).style.display = 'block';
                });
            });
            // Command override checkbox
            document.getElementById('product-use-command')?.addEventListener('change', (e) => {
                document.getElementById('command-override-group').style.display = e.target.checked ? 'block' : 'none';
            });
            // Image preview
            document.getElementById('product-image')?.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        document.getElementById('product-image-preview').innerHTML = `<img src="${ev.target.result}" style="max-width:100px; max-height:100px; border-radius:8px;">`;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        // Purchase button delegation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('shop-buy-btn')) {
                const id = parseInt(e.target.dataset.id);
                const item = this.items.find(i => i.id === id);
                if (item) this.purchaseItem(item);
            }
            if (e.target.classList.contains('shop-edit-btn')) {
                const id = parseInt(e.target.dataset.id);
                this.openProductModal(id);
            }
            if (e.target.classList.contains('shop-delete-btn')) {
                const id = parseInt(e.target.dataset.id);
                this.deleteItem(id);
            }
        });
    }

    attachModalEvents() {}

    async updateBalance() {
        const balance = await this.getPlayerBalance();
        const balanceEl = document.getElementById('shop-player-balance');
        if (balanceEl) balanceEl.innerText = (balance !== null) ? balance : '?';
    }

    renderProducts() {
        const container = document.getElementById('shop-products');
        if (!container) return;

        const search = document.getElementById('shop-search')?.value.toLowerCase() || '';
        const category = document.getElementById('shop-category-filter')?.value || 'all';

        let filtered = this.items;
        if (search) {
            filtered = filtered.filter(i => i.name.toLowerCase().includes(search) || (i.description && i.description.toLowerCase().includes(search)));
        }
        if (category !== 'all') {
            filtered = filtered.filter(i => i.category === category);
        }

        const isAdmin = this.access.hasRole('master') || this.access.hasRole('owner');
        const defaultAvatar = window.DEFAULT_AVATAR || `data:image/svg+xml,%3Csvg xmlns='http%3A//www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='40' r='25' fill='%23333' stroke='%23D4AF37' stroke-width='3'/%3E%3Crect x='30' y='65' width='40' height='30' fill='%23333' stroke='%23D4AF37' stroke-width='3'/%3E%3C/svg%3E`;

        if (filtered.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-secondary);">No products found</div>';
            return;
        }

        container.innerHTML = filtered.map(item => `
            <div class="product-card" style="background:var(--glass-bg); backdrop-filter:blur(var(--glass-blur)); border:1px solid var(--glass-border); border-radius:16px; padding:1.5rem; transition:transform 0.2s;">
                <img src="${item.image || defaultAvatar}" alt="${item.name}" style="width:100px; height:100px; object-fit:contain; display:block; margin:0 auto 1rem; background:var(--bg-secondary); border-radius:12px;" onerror="this.src='${defaultAvatar}'">
                <div style="font-size:1.2rem; font-weight:600; text-align:center; margin-bottom:0.3rem;">${this.escapeHtml(item.name)}</div>
                <div style="color:var(--text-secondary); font-size:0.9rem; text-align:center; margin-bottom:0.8rem;">${this.escapeHtml(item.description || '')}</div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
                    <span style="color:var(--accent-primary); font-weight:600;">💰 ${item.price} scrap</span>
                    <span style="color:var(--text-secondary); font-size:0.8rem;">${item.stock === -1 ? '∞' : item.stock + ' left'}</span>
                </div>
                <div style="display:flex; gap:0.5rem; margin-top:1rem;">
                    <button class="shop-buy-btn small-btn" data-id="${item.id}" style="flex:2; background:var(--accent-primary); color:#000; border:none; border-radius:30px; padding:0.5rem;">Buy</button>
                    ${isAdmin ? `
                        <button class="shop-edit-btn small-btn" data-id="${item.id}" style="flex:1;">✏️</button>
                        <button class="shop-delete-btn small-btn" data-id="${item.id}" style="flex:1; background:var(--error); color:#fff;">🗑️</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    async purchaseItem(item) {
        const playerId = this.getUserPlatformId();
        if (!playerId) {
            toast.error('Platform ID not set. Go to Profile to add your PSN ID / Gamertag.');
            return;
        }

        let balance;
        try {
            const balanceRes = await ConnectionManager.executeCommand(`economy.balance "${playerId}"`);
            balance = parseInt(balanceRes) || 0;
            if (balance < item.price) {
                toast.error(`You need ${item.price} scrap. You have ${balance}.`);
                return;
            }
        } catch (err) {
            toast.error('Could not check balance: ' + err.message);
            return;
        }

        if (!confirm(`Buy ${item.name} for ${item.price} scrap?`)) return;

        try {
            await ConnectionManager.executeCommand(`economy.remove "${playerId}" ${item.price}`);
            const claimRes = await fetch(`${AppState.connection.bridgeUrl}/api/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId: playerId,
                    itemShortname: item.shortname,
                    quantity: 1,
                    expiresAt: null
                })
            });
            if (!claimRes.ok) throw new Error('Failed to add claim');
            toast.success(`Purchased ${item.name}! Check your claims tab.`);
            this.updateBalance();
            if (window.claimSystem && typeof window.claimSystem.refresh === 'function') {
                window.claimSystem.refresh();
            }
        } catch (err) {
            toast.error(`Purchase failed: ${err.message}`);
        }
    }

    openProductModal(id = null) {
        this.editingId = id;
        const modal = document.getElementById('shop-product-modal');
        const title = document.getElementById('shop-modal-title');
        title.innerText = id ? 'Edit Product' : 'Create Product';

        // Clear fields
        document.getElementById('product-name').value = '';
        document.getElementById('product-desc').value = '';
        document.getElementById('product-category').value = '';
        document.getElementById('product-image-preview').innerHTML = '';
        document.getElementById('product-shortname').value = '';
        document.getElementById('product-quantity').value = '1';
        document.getElementById('product-price').value = '0';
        document.getElementById('product-stock').value = '-1';
        document.getElementById('product-use-command').checked = false;
        document.getElementById('command-override-group').style.display = 'none';
        document.getElementById('product-command').value = '';

        if (id) {
            const item = this.items.find(i => i.id === id);
            if (item) {
                document.getElementById('product-name').value = item.name || '';
                document.getElementById('product-desc').value = item.description || '';
                document.getElementById('product-category').value = item.category || '';
                if (item.image) {
                    document.getElementById('product-image-preview').innerHTML = `<img src="${item.image}" style="max-width:100px;">`;
                }
                document.getElementById('product-shortname').value = item.shortname || '';
                document.getElementById('product-price').value = item.price || 0;
                document.getElementById('product-stock').value = item.stock || -1;
                if (item.command) {
                    document.getElementById('product-use-command').checked = true;
                    document.getElementById('command-override-group').style.display = 'block';
                    document.getElementById('product-command').value = item.command;
                }
            }
        }

        // Reset to info tab
        document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.shop-tab-content').forEach(c => c.style.display = 'none');
        const firstTab = document.querySelector('.shop-tab[data-tab="info"]');
        if (firstTab) firstTab.classList.add('active');
        document.getElementById('shop-info-tab').style.display = 'block';

        modal.classList.remove('hidden');
    }

    async saveProduct() {
        const name = document.getElementById('product-name').value.trim();
        const desc = document.getElementById('product-desc').value.trim();
        const category = document.getElementById('product-category').value;
        const shortname = document.getElementById('product-shortname').value.trim();
        const quantity = parseInt(document.getElementById('product-quantity').value) || 1;
        const price = parseInt(document.getElementById('product-price').value) || 0;
        const stock = parseInt(document.getElementById('product-stock').value) || -1;
        const useCommand = document.getElementById('product-use-command').checked;
        const command = useCommand ? document.getElementById('product-command').value.trim() : null;

        let image = null;
        const fileInput = document.getElementById('product-image');
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            image = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
        } else if (this.editingId) {
            const existing = this.items.find(i => i.id === this.editingId);
            if (existing) image = existing.image;
        }

        if (!name || !category || !shortname) {
            toast.error('Name, category, and shortname are required');
            return;
        }

        const payload = { name, description: desc, shortname, price, stock, category, image, command };

        try {
            let res;
            if (this.editingId) {
                res = await fetch(`${AppState.connection.bridgeUrl}/api/shop/items/${this.editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch(`${AppState.connection.bridgeUrl}/api/shop/items`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            if (!res.ok) throw new Error('Save failed');
            toast.success(`Product ${this.editingId ? 'updated' : 'created'}`);
            await this.loadItems();
            document.getElementById('shop-product-modal').classList.add('hidden');
        } catch (err) {
            toast.error('Failed to save product: ' + err.message);
        }
    }

    async deleteItem(id) {
        if (!confirm('Delete this product?')) return;
        try {
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/shop/items/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Delete failed');
            toast.info('Product deleted');
            await this.loadItems();
        } catch (err) {
            toast.error('Delete failed: ' + err.message);
        }
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
        await this.loadItems();
        this.updateBalance();
        toast.success('Shop refreshed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.shop = new Shop();
});