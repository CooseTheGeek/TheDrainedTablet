// VERETECH ECONOMY - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Stewart (CooseTheGeek). All Rights Reserved.

class VeretechEconomy {
    constructor(tablet) {
        this.tablet = tablet;
        this.shopItems = this.loadShop();
        this.transactions = this.loadTransactions();
        this.init();
    }

    loadShop() {
        const saved = localStorage.getItem('drained_veretech_shop');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'AK-47', shortname: 'rifle.ak', price: 500, stock: 10, category: 'weapons' },
            { id: 2, name: 'C4', shortname: 'explosive.timed', price: 800, stock: 5, category: 'explosives' },
            { id: 3, name: 'Rocket', shortname: 'ammo.rocket.basic', price: 600, stock: 8, category: 'explosives' },
            { id: 4, name: 'Metal Facemask', shortname: 'metal.facemask', price: 300, stock: 15, category: 'armor' },
            { id: 5, name: 'Medical Syringe', shortname: 'syringe.medical', price: 50, stock: 50, category: 'medical' }
        ];
    }

    loadTransactions() {
        const saved = localStorage.getItem('drained_veretech_transactions');
        return saved ? JSON.parse(saved) : [];
    }

    saveShop() {
        localStorage.setItem('drained_veretech_shop', JSON.stringify(this.shopItems));
    }

    saveTransactions() {
        localStorage.setItem('drained_veretech_transactions', JSON.stringify(this.transactions.slice(0, 100)));
    }

    init() {
        this.createVeretechHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'veretech') {
                this.refresh();
            }
        });
    }

    createVeretechHTML() {
        const veretechTab = document.getElementById('tab-veretech');
        if (!veretechTab) return;

        veretechTab.innerHTML = `
            <div class="veretech-container">
                <div class="veretech-header">
                    <h2>💎 VERETECH ECONOMY</h2>
                </div>

                <div class="veretech-tabs">
                    <button class="veretech-tab active" data-tab="shop">🏪 SHOP</button>
                    <button class="veretech-tab" data-tab="bank">🏦 BANK</button>
                    <button class="veretech-tab" data-tab="market">📊 MARKET</button>
                </div>

                <div id="shop-tab" class="veretech-tab-content active">
                    <div class="shop-controls">
                        <input type="text" id="shop-search" placeholder="Search items...">
                        <select id="shop-category">
                            <option value="all">All Categories</option>
                            <option value="weapons">Weapons</option>
                            <option value="armor">Armor</option>
                            <option value="explosives">Explosives</option>
                            <option value="medical">Medical</option>
                            <option value="resources">Resources</option>
                        </select>
                        <button id="add-shop-item" class="veretech-btn">➕ ADD ITEM</button>
                    </div>

                    <div class="shop-grid" id="shop-grid"></div>
                </div>

                <div id="bank-tab" class="veretech-tab-content">
                    <div class="bank-controls">
                        <div class="form-group">
                            <label>Player:</label>
                            <input type="text" id="bank-player" placeholder="Player name">
                        </div>
                        <div class="form-group">
                            <label>Amount:</label>
                            <input type="number" id="bank-amount" value="100">
                        </div>
                        <div class="button-group">
                            <button id="bank-deposit" class="veretech-btn">💰 DEPOSIT</button>
                            <button id="bank-withdraw" class="veretech-btn">💳 WITHDRAW</button>
                            <button id="bank-transfer" class="veretech-btn">🔄 TRANSFER</button>
                            <button id="bank-balance" class="veretech-btn">📊 CHECK BALANCE</button>
                        </div>
                    </div>

                    <div class="bank-balances" id="bank-balances"></div>
                </div>

                <div id="market-tab" class="veretech-tab-content">
                    <div class="market-stats">
                        <h3>MARKET PRICES</h3>
                        <div id="market-prices" class="market-prices"></div>
                    </div>

                    <div class="recent-trades">
                        <h3>RECENT TRADES</h3>
                        <div id="recent-trades" class="recent-trades-list"></div>
                    </div>
                </div>

                <div class="veretech-actions">
                    <button id="save-veretech" class="veretech-btn primary">💾 SAVE SHOP</button>
                    <button id="reset-veretech" class="veretech-btn">🔄 RESET</button>
                </div>
            </div>
        `;

        this.renderShop();
        this.renderBankBalances();
        this.renderMarket();
    }

    setupEventListeners() {
        document.querySelectorAll('.veretech-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.veretech-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.veretech-tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(e.target.dataset.tab + '-tab').classList.add('active');
            });
        });

        document.getElementById('shop-search')?.addEventListener('input', () => this.renderShop());
        document.getElementById('shop-category')?.addEventListener('change', () => this.renderShop());
        document.getElementById('add-shop-item')?.addEventListener('click', () => this.addShopItem());

        document.getElementById('bank-deposit')?.addEventListener('click', () => this.bankAction('deposit'));
        document.getElementById('bank-withdraw')?.addEventListener('click', () => this.bankAction('withdraw'));
        document.getElementById('bank-transfer')?.addEventListener('click', () => this.bankAction('transfer'));
        document.getElementById('bank-balance')?.addEventListener('click', () => this.checkBalance());

        document.getElementById('save-veretech')?.addEventListener('click', () => this.saveShop());
        document.getElementById('reset-veretech')?.addEventListener('click', () => this.resetShop());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('buy-item')) {
                const id = parseInt(e.target.dataset.id);
                this.buyItem(id);
            }
            if (e.target.classList.contains('sell-item')) {
                const id = parseInt(e.target.dataset.id);
                this.sellItem(id);
            }
            if (e.target.classList.contains('edit-item')) {
                const id = parseInt(e.target.dataset.id);
                this.editItem(id);
            }
            if (e.target.classList.contains('delete-item')) {
                const id = parseInt(e.target.dataset.id);
                this.deleteItem(id);
            }
        });
    }

    renderShop() {
        const grid = document.getElementById('shop-grid');
        if (!grid) return;

        const search = document.getElementById('shop-search')?.value.toLowerCase() || '';
        const category = document.getElementById('shop-category')?.value || 'all';

        let filtered = this.shopItems;
        if (search) {
            filtered = filtered.filter(item => item.name.toLowerCase().includes(search));
        }
        if (category !== 'all') {
            filtered = filtered.filter(item => item.category === category);
        }

        let html = '';
        filtered.forEach(item => {
            html += `
                <div class="shop-item">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">${item.price} scrap</div>
                    <div class="item-stock">Stock: ${item.stock}</div>
                    <div class="item-actions">
                        <button class="small-btn buy-item" data-id="${item.id}">🛒 BUY</button>
                        <button class="small-btn sell-item" data-id="${item.id}">💰 SELL</button>
                        <button class="small-btn edit-item" data-id="${item.id}">✏️</button>
                        <button class="small-btn delete-item" data-id="${item.id}">🗑️</button>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    renderBankBalances() {
        const container = document.getElementById('bank-balances');
        container.innerHTML = `
            <div class="balance-card">
                <h4>RustGod</h4>
                <div>Cash: 5,420</div>
                <div>Bank: 12,000</div>
            </div>
            <div class="balance-card">
                <h4>BuilderBob</h4>
                <div>Cash: 2,150</div>
                <div>Bank: 8,500</div>
            </div>
            <div class="balance-card">
                <h4>PvPKing</h4>
                <div>Cash: 8,450</div>
                <div>Bank: 3,000</div>
            </div>
        `;
    }

    renderMarket() {
        const prices = document.getElementById('market-prices');
        prices.innerHTML = `
            <div class="price-row"><span>AK-47:</span> <span>450 📈 +12%</span></div>
            <div class="price-row"><span>C4:</span> <span>800 📈 +5%</span></div>
            <div class="price-row"><span>Rocket:</span> <span>600 📉 -3%</span></div>
            <div class="price-row"><span>Scrap:</span> <span>1.0 📈 +2%</span></div>
        `;

        const trades = document.getElementById('recent-trades');
        trades.innerHTML = `
            <div class="trade-row">RustGod bought AK-47 - 2m ago</div>
            <div class="trade-row">BuilderBob sold C4 - 5m ago</div>
            <div class="trade-row">PvPKing bought Rocket - 10m ago</div>
        `;
    }

    addShopItem() {
        const name = prompt('Item name:');
        const price = prompt('Price:');
        const stock = prompt('Stock:');
        const category = prompt('Category (weapons/armor/explosives/medical/resources):');

        if (name && price && stock && category) {
            const newItem = {
                id: Date.now(),
                name: name,
                shortname: name.toLowerCase().replace(/\s+/g, '.'),
                price: parseInt(price),
                stock: parseInt(stock),
                category: category
            };
            this.shopItems.push(newItem);
            this.saveShop();
            this.renderShop();
            this.tablet.showToast(`Added ${name} to shop`, 'success');
        }
    }

    buyItem(id) {
        const item = this.shopItems.find(i => i.id === id);
        if (item && item.stock > 0) {
            item.stock--;
            this.saveShop();
            this.renderShop();
            this.tablet.showToast(`Bought ${item.name} for ${item.price} scrap`, 'success');
            
            this.transactions.unshift({
                type: 'buy',
                item: item.name,
                price: item.price,
                time: new Date().toISOString()
            });
            this.saveTransactions();
        }
    }

    sellItem(id) {
        const item = this.shopItems.find(i => i.id === id);
        if (item) {
            item.stock++;
            this.saveShop();
            this.renderShop();
            this.tablet.showToast(`Sold ${item.name} to shop`, 'info');
        }
    }

    editItem(id) {
        const item = this.shopItems.find(i => i.id === id);
        if (item) {
            const newPrice = prompt('New price:', item.price);
            if (newPrice) {
                item.price = parseInt(newPrice);
                this.saveShop();
                this.renderShop();
                this.tablet.showToast('Item updated', 'success');
            }
        }
    }

    deleteItem(id) {
        this.tablet.showConfirm('Delete this item?', (confirmed) => {
            if (confirmed) {
                this.shopItems = this.shopItems.filter(i => i.id !== id);
                this.saveShop();
                this.renderShop();
                this.tablet.showToast('Item deleted', 'info');
            }
        });
    }

    bankAction(action) {
        const player = document.getElementById('bank-player').value;
        const amount = document.getElementById('bank-amount').value;

        if (!player || !amount) {
            this.tablet.showError('Enter player and amount');
            return;
        }

        this.tablet.showToast(`${action} ${amount} scrap ${action === 'transfer' ? 'to/from' : ''} ${player}`, 'info');
    }

    checkBalance() {
        const player = document.getElementById('bank-player').value;
        if (!player) {
            this.tablet.showError('Enter player name');
            return;
        }
        this.tablet.showToast(`${player}'s balance: 5,420 scrap`, 'success');
    }

    saveShop() {
        this.saveShop();
        this.tablet.showToast('Shop saved', 'success');
    }

    resetShop() {
        this.tablet.showConfirm('Reset shop to default?', (confirmed) => {
            if (confirmed) {
                this.shopItems = [
                    { id: 1, name: 'AK-47', shortname: 'rifle.ak', price: 500, stock: 10, category: 'weapons' },
                    { id: 2, name: 'C4', shortname: 'explosive.timed', price: 800, stock: 5, category: 'explosives' },
                    { id: 3, name: 'Rocket', shortname: 'ammo.rocket.basic', price: 600, stock: 8, category: 'explosives' },
                    { id: 4, name: 'Metal Facemask', shortname: 'metal.facemask', price: 300, stock: 15, category: 'armor' },
                    { id: 5, name: 'Medical Syringe', shortname: 'syringe.medical', price: 50, stock: 50, category: 'medical' }
                ];
                this.renderShop();
                this.tablet.showToast('Shop reset', 'info');
            }
        });
    }

    refresh() {
        this.renderShop();
        this.renderBankBalances();
        this.renderMarket();
        this.tablet.showToast('Veretech economy refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.veretechEconomy = new VeretechEconomy(window.drainedTablet);
});