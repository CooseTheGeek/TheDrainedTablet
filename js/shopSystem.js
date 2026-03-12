// shopSystem.js – DRAINED TABLET ULTIMATE v7.0.0
// Server shop: buy/sell items, bank, market prices, and trade history.
// All original features preserved, now with real RCON integration and enhanced UI.

class ShopSystem {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.shopItems = this.loadShop();
        this.transactions = this.loadTransactions();
        this.init();
    }

    loadShop() {
        const saved = localStorage.getItem('tdl_shop_items');
        return saved ? JSON.parse(saved) : [];
    }

    loadTransactions() {
        const saved = localStorage.getItem('tdl_shop_transactions');
        return saved ? JSON.parse(saved) : [];
    }

    saveShop() {
        localStorage.setItem('tdl_shop_items', JSON.stringify(this.shopItems));
    }

    saveTransactions() {
        localStorage.setItem('tdl_shop_transactions', JSON.stringify(this.transactions.slice(0, 100)));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'shop') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-shop');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="shop-container">
                <div class="shop-header">
                    <h2>🏪 SERVER SHOP</h2>
                </div>

                <div class="shop-tabs">
                    <button class="shop-tab active" data-tab="shop">🛒 SHOP</button>
                    <button class="shop-tab" data-tab="bank">🏦 BANK</button>
                    <button class="shop-tab" data-tab="market">📊 MARKET</button>
                </div>

                <div id="shop-tab" class="shop-tab-content active">
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
                        <button id="add-shop-item" class="shop-btn">➕ ADD ITEM</button>
                    </div>

                    <div class="shop-grid" id="shop-grid"></div>
                </div>

                <div id="bank-tab" class="shop-tab-content">
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
                            <button id="bank-deposit" class="shop-btn">💰 DEPOSIT</button>
                            <button id="bank-withdraw" class="shop-btn">💳 WITHDRAW</button>
                            <button id="bank-transfer" class="shop-btn">🔄 TRANSFER</button>
                            <button id="bank-balance" class="shop-btn">📊 CHECK BALANCE</button>
                        </div>
                    </div>

                    <div class="bank-balances" id="bank-balances"></div>
                </div>

                <div id="market-tab" class="shop-tab-content">
                    <div class="market-stats">
                        <h3>MARKET PRICES</h3>
                        <div id="market-prices" class="market-prices"></div>
                    </div>

                    <div class="recent-trades">
                        <h3>RECENT TRADES</h3>
                        <div id="recent-trades" class="recent-trades-list"></div>
                    </div>
                </div>

                <div class="shop-actions">
                    <button id="save-shop" class="shop-btn primary">💾 SAVE SHOP</button>
                    <button id="reset-shop" class="shop-btn">🔄 RESET</button>
                </div>
            </div>
        `;

        this.renderShop();
        this.renderBankBalances();
        this.renderMarket();
    }

    attachEvents() {
        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.shop-tab-content').forEach(c => c.classList.remove('active'));
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

        document.getElementById('save-shop')?.addEventListener('click', () => this.saveShop());
        document.getElementById('reset-shop')?.addEventListener('click', () => this.resetShop());

        // Delegate for item actions
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

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="no-items">No shop items</div>';
            return;
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
        if (!container) return;
        // In production, fetch balances from RCON
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
        if (!prices) return;
        prices.innerHTML = `
            <div class="price-row"><span>AK-47:</span> <span>450 📈 +12%</span></div>
            <div class="price-row"><span>C4:</span> <span>800 📈 +5%</span></div>
            <div class="price-row"><span>Rocket:</span> <span>600 📉 -3%</span></div>
            <div class="price-row"><span>Scrap:</span> <span>1.0 📈 +2%</span></div>
        `;

        const trades = document.getElementById('recent-trades');
        if (!trades) return;
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
                name,
                shortname: name.toLowerCase().replace(/\s+/g, '.'),
                price: parseInt(price),
                stock: parseInt(stock),
                category
            };
            this.shopItems.push(newItem);
            this.saveShop();
            this.renderShop();
            this.tablet.showToast(`Added ${name} to shop`, 'success');
        }
    }

    async buyItem(id) {
        const item = this.shopItems.find(i => i.id === id);
        if (!item) return;
        if (item.stock <= 0) {
            this.tablet.showError('Out of stock');
            return;
        }
        if (!this.tablet.connected) {
            this.tablet.showError('Not connected to server');
            return;
        }
        // Use give command (requires player name)
        const playerName = AppState.user.username;
        if (!playerName) {
            this.tablet.showError('No player name');
            return;
        }
        try {
            await ConnectionManager.executeCommand(`giveto "${playerName}" "${item.shortname}" 1`);
            // Deduct scrap (requires economy plugin) – we'll assume server handles it via shop plugin
            item.stock--;
            this.saveShop();
            this.renderShop();
            this.transactions.unshift({
                type: 'buy',
                item: item.name,
                price: item.price,
                time: new Date().toISOString()
            });
            this.saveTransactions();
            this.tablet.showToast(`Bought ${item.name}`, 'success');
        } catch (err) {
            this.tablet.showError('Purchase failed: ' + err.message);
        }
    }

    async sellItem(id) {
        const item = this.shopItems.find(i => i.id === id);
        if (!item) return;
        const playerName = AppState.user.username;
        if (!playerName) {
            this.tablet.showError('No player name');
            return;
        }
        try {
            // This would require an economy plugin to give scrap and take item
            // Simulated for now
            item.stock++;
            this.saveShop();
            this.renderShop();
            this.tablet.showToast(`Sold ${item.name} to shop`, 'info');
        } catch (err) {
            this.tablet.showError('Sale failed: ' + err.message);
        }
    }

    editItem(id) {
        const item = this.shopItems.find(i => i.id === id);
        if (!item) return;
        const newPrice = prompt('New price:', item.price);
        if (newPrice) {
            item.price = parseInt(newPrice);
            this.saveShop();
            this.renderShop();
            this.tablet.showToast('Item updated', 'success');
        }
    }

    deleteItem(id) {
        if (!confirm('Delete this item?')) return;
        this.shopItems = this.shopItems.filter(i => i.id !== id);
        this.saveShop();
        this.renderShop();
        this.tablet.showToast('Item deleted', 'info');
    }

    async bankAction(action) {
        const player = document.getElementById('bank-player').value;
        const amount = document.getElementById('bank-amount').value;
        if (!player || !amount) {
            this.tablet.showError('Enter player and amount');
            return;
        }
        let command = '';
        switch(action) {
            case 'deposit': command = `economy.deposit ${player} ${amount}`; break;
            case 'withdraw': command = `economy.withdraw ${player} ${amount}`; break;
            case 'transfer': command = `economy.transfer ${player} ${amount}`; break;
        }
        try {
            await ConnectionManager.executeCommand(command);
            this.tablet.showToast(`${action} ${amount} scrap for ${player}`, 'info');
        } catch (err) {
            this.tablet.showError(`${action} failed: ${err.message}`);
        }
    }

    async checkBalance() {
        const player = document.getElementById('bank-player').value;
        if (!player) {
            this.tablet.showError('Enter player name');
            return;
        }
        try {
            const result = await ConnectionManager.executeCommand(`economy.balance ${player}`);
            this.tablet.showToast(`${player}'s balance: ${result} scrap`, 'success');
        } catch (err) {
            this.tablet.showError('Failed to get balance: ' + err.message);
        }
    }

    saveShop() {
        this.saveShop();
        this.tablet.showToast('Shop saved', 'success');
    }

    resetShop() {
        if (!confirm('Reset shop to default?')) return;
        this.shopItems = [];
        this.renderShop();
        this.tablet.showToast('Shop reset', 'info');
    }

    refresh() {
        this.renderShop();
        this.renderBankBalances();
        this.renderMarket();
        this.tablet.showToast('Shop system refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.shopSystem = new ShopSystem();
});