// TRADING FLOOR - EXCLUSIVE FEATURE
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class TradingFloor {
    constructor(tablet) {
        this.tablet = tablet;
        this.listings = this.loadListings();
        this.trades = this.loadTrades();
        this.prices = this.loadPrices();
        this.marketHistory = this.loadHistory();
        this.init();
    }

    loadListings() {
        const saved = localStorage.getItem('drained_trading_listings');
        return saved ? JSON.parse(saved) : [];
    }

    loadTrades() {
        const saved = localStorage.getItem('drained_trading_trades');
        return saved ? JSON.parse(saved) : [];
    }

    loadPrices() {
        const saved = localStorage.getItem('drained_trading_prices');
        return saved ? JSON.parse(saved) : {
            'rifle.ak': 450,
            'explosive.timed': 800,
            'ammo.rocket.basic': 600,
            'sulfur': 2.5,
            'metal.refined': 15,
            'scrap': 1
        };
    }

    loadHistory() {
        const saved = localStorage.getItem('drained_market_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveAll() {
        localStorage.setItem('drained_trading_listings', JSON.stringify(this.listings));
        localStorage.setItem('drained_trading_trades', JSON.stringify(this.trades));
        localStorage.setItem('drained_trading_prices', JSON.stringify(this.prices));
        localStorage.setItem('drained_market_history', JSON.stringify(this.marketHistory));
    }

    init() {
        this.createTradingHTML();
        this.setupEventListeners();
        this.startMarketSimulation();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'trading') {
                this.refresh();
            }
        });
    }

    createTradingHTML() {
        const tradingTab = document.getElementById('tab-trading');
        if (!tradingTab) return;

        tradingTab.innerHTML = `
            <div class="trading-container">
                <div class="trading-header">
                    <h2>💰 TRADING FLOOR</h2>
                    <div class="trading-balance">
                        <span>Your Balance:</span>
                        <span class="balance-amount" id="user-balance">5,420</span>
                        <span class="balance-currency">SCRAP</span>
                    </div>
                </div>
                
                <div class="market-prices">
                    <h3>📈 LIVE MARKET PRICES</h3>
                    <div class="prices-grid" id="prices-grid"></div>
                </div>
                
                <div class="trading-grid">
                    <div class="listings-section">
                        <h3>📋 ACTIVE LISTINGS</h3>
                        <div class="listings-controls">
                            <button id="create-listing" class="trading-btn">+ CREATE LISTING</button>
                            <button id="refresh-listings" class="trading-btn">🔄 REFRESH</button>
                        </div>
                        <div id="listings-container" class="listings-container"></div>
                    </div>
                    
                    <div class="my-trades-section">
                        <h3>🤝 MY TRADES</h3>
                        <div class="trades-tabs">
                            <button class="trade-tab active" data-tab="active">ACTIVE</button>
                            <button class="trade-tab" data-tab="history">HISTORY</button>
                        </div>
                        <div id="my-trades-container" class="my-trades-container"></div>
                    </div>
                </div>
                
                <div class="trade-history">
                    <h3>📊 RECENT TRADES</h3>
                    <div id="recent-trades"></div>
                </div>
            </div>
        `;

        this.renderPrices();
        this.renderListings();
        this.renderMyTrades();
        this.renderRecentTrades();
    }

    setupEventListeners() {
        document.getElementById('create-listing')?.addEventListener('click', () => this.showCreateListing());
        document.getElementById('refresh-listings')?.addEventListener('click', () => this.refresh());
        
        document.querySelectorAll('.trade-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.trade-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.renderMyTrades(e.target.dataset.tab);
            });
        });
    }

    renderPrices() {
        const grid = document.getElementById('prices-grid');
        if (!grid) return;

        let html = '';
        Object.entries(this.prices).forEach(([item, price]) => {
            const change = (Math.random() * 20 - 10).toFixed(1);
            const icon = change > 0 ? '📈' : '📉';
            html += `
                <div class="price-card">
                    <div class="price-item">${this.getItemName(item)}</div>
                    <div class="price-value">${price}</div>
                    <div class="price-change ${change > 0 ? 'positive' : 'negative'}">
                        ${icon} ${Math.abs(change)}%
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    renderListings() {
        const container = document.getElementById('listings-container');
        if (!container) return;

        if (this.listings.length === 0) {
            container.innerHTML = '<div class="no-listings">No active listings</div>';
            return;
        }

        let html = '';
        this.listings.forEach(listing => {
            html += `
                <div class="listing-card">
                    <div class="listing-header">
                        <span class="listing-seller">${listing.seller}</span>
                        <span class="listing-type">${listing.type === 'sell' ? 'SELLING' : 'BUYING'}</span>
                    </div>
                    <div class="listing-body">
                        <div class="listing-item">
                            <span class="item-name">${this.getItemName(listing.item)}</span>
                            <span class="item-quantity">x${listing.quantity}</span>
                        </div>
                        <div class="listing-price">
                            <span class="price-label">Price:</span>
                            <span class="price-value">${listing.price} scrap</span>
                        </div>
                        ${listing.notes ? `<div class="listing-notes">"${listing.notes}"</div>` : ''}
                    </div>
                    <div class="listing-actions">
                        <button class="trade-btn" onclick="tradingFloor.buyListing('${listing.id}')">BUY</button>
                        <button class="trade-btn" onclick="tradingFloor.messageSeller('${listing.id}')">💬 MESSAGE</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    renderMyTrades(tab = 'active') {
        const container = document.getElementById('my-trades-container');
        if (!container) return;

        const trades = tab === 'active' 
            ? this.trades.filter(t => t.status === 'active')
            : this.trades.filter(t => t.status !== 'active');

        if (trades.length === 0) {
            container.innerHTML = `<div class="no-trades">No ${tab} trades</div>`;
            return;
        }

        let html = '';
        trades.forEach(trade => {
            html += `
                <div class="trade-card ${trade.status}">
                    <div class="trade-header">
                        <span class="trade-with">With: ${trade.with}</span>
                        <span class="trade-status">${trade.status.toUpperCase()}</span>
                    </div>
                    <div class="trade-items">
                        <div class="trade-offer">
                            <span>You give:</span>
                            <span>${trade.offer.quantity}x ${this.getItemName(trade.offer.item)}</span>
                        </div>
                        <div class="trade-arrow">→</div>
                        <div class="trade-receive">
                            <span>You get:</span>
                            <span>${trade.receive.quantity}x ${this.getItemName(trade.receive.item)}</span>
                        </div>
                    </div>
                    ${trade.status === 'active' ? `
                        <div class="trade-actions">
                            <button class="trade-btn accept" onclick="tradingFloor.acceptTrade('${trade.id}')">✓ ACCEPT</button>
                            <button class="trade-btn decline" onclick="tradingFloor.declineTrade('${trade.id}')">✗ DECLINE</button>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        container.innerHTML = html;
    }

    renderRecentTrades() {
        const container = document.getElementById('recent-trades');
        if (!container) return;

        if (this.marketHistory.length === 0) {
            container.innerHTML = '<div class="no-history">No recent trades</div>';
            return;
        }

        let html = '<table class="history-table"><tr><th>Time</th><th>Item</th><th>Quantity</th><th>Price</th></tr>';
        
        this.marketHistory.slice(0, 10).forEach(trade => {
            const time = new Date(trade.timestamp).toLocaleTimeString();
            html += `
                <tr>
                    <td>${time}</td>
                    <td>${this.getItemName(trade.item)}</td>
                    <td>${trade.quantity}</td>
                    <td>${trade.price}</td>
                </tr>
            `;
        });
        
        html += '</table>';
        container.innerHTML = html;
    }

    showCreateListing() {
        // Create modal for new listing
        const modal = document.createElement('div');
        modal.className = 'trading-modal';
        modal.innerHTML = `
            <div class="trading-modal-content">
                <h3>CREATE LISTING</h3>
                <div class="form-group">
                    <label>Type:</label>
                    <select id="listing-type">
                        <option value="sell">Selling</option>
                        <option value="buy">Buying</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Item:</label>
                    <input type="text" id="listing-item" placeholder="Item shortname or search">
                </div>
                <div class="form-group">
                    <label>Quantity:</label>
                    <input type="number" id="listing-quantity" min="1" value="1">
                </div>
                <div class="form-group">
                    <label>Price per item:</label>
                    <input type="number" id="listing-price" min="1" value="100">
                </div>
                <div class="form-group">
                    <label>Notes (optional):</label>
                    <textarea id="listing-notes" rows="2"></textarea>
                </div>
                <div class="modal-actions">
                    <button class="trading-btn" onclick="tradingFloor.createListing()">CREATE</button>
                    <button class="trading-btn cancel" onclick="this.closest('.trading-modal').remove()">CANCEL</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    createListing() {
        const type = document.getElementById('listing-type').value;
        const item = document.getElementById('listing-item').value;
        const quantity = parseInt(document.getElementById('listing-quantity').value);
        const price = parseInt(document.getElementById('listing-price').value);
        const notes = document.getElementById('listing-notes').value;

        if (!item || !quantity || !price) {
            this.tablet.showError('Please fill all fields');
            return;
        }

        const listing = {
            id: 'listing_' + Date.now(),
            seller: this.tablet.currentUser || 'Anonymous',
            type: type,
            item: item,
            quantity: quantity,
            price: price,
            notes: notes,
            created: Date.now(),
            status: 'active'
        };

        this.listings.push(listing);
        this.saveAll();
        this.renderListings();
        
        document.querySelector('.trading-modal').remove();
        this.tablet.showToast('Listing created', 'success');
    }

    buyListing(listingId) {
        const listing = this.listings.find(l => l.id === listingId);
        if (!listing) return;

        this.tablet.showConfirm(`Buy ${listing.quantity}x ${listing.item} for ${listing.price} scrap?`, (confirmed) => {
            if (confirmed) {
                // Remove listing
                this.listings = this.listings.filter(l => l.id !== listingId);
                
                // Add to history
                this.marketHistory.unshift({
                    item: listing.item,
                    quantity: listing.quantity,
                    price: listing.price,
                    buyer: this.tablet.currentUser,
                    seller: listing.seller,
                    timestamp: Date.now()
                });
                
                this.saveAll();
                this.renderListings();
                this.renderRecentTrades();
                this.tablet.showToast('Purchase complete!', 'success');
            }
        });
    }

    messageSeller(listingId) {
        const listing = this.listings.find(l => l.id === listingId);
        if (!listing) return;

        this.tablet.showToast(`Messaging ${listing.seller}...`, 'info');
    }

    acceptTrade(tradeId) {
        const trade = this.trades.find(t => t.id === tradeId);
        if (!trade) return;

        trade.status = 'completed';
        this.saveAll();
        this.renderMyTrades();
        this.tablet.showToast('Trade accepted', 'success');
    }

    declineTrade(tradeId) {
        const trade = this.trades.find(t => t.id === tradeId);
        if (!trade) return;

        trade.status = 'declined';
        this.saveAll();
        this.renderMyTrades();
        this.tablet.showToast('Trade declined', 'info');
    }

    startMarketSimulation() {
        setInterval(() => {
            // Simulate price changes
            Object.keys(this.prices).forEach(item => {
                const change = (Math.random() * 0.1) - 0.05;
                this.prices[item] = Math.max(1, Math.round(this.prices[item] * (1 + change)));
            });
            
            this.renderPrices();
        }, 30000);
    }

    getItemName(shortname) {
        const names = {
            'rifle.ak': 'AK-47',
            'explosive.timed': 'C4',
            'ammo.rocket.basic': 'Rocket',
            'sulfur': 'Sulfur',
            'metal.refined': 'HQM',
            'scrap': 'Scrap'
        };
        return names[shortname] || shortname;
    }

    refresh() {
        this.renderPrices();
        this.renderListings();
        this.renderMyTrades();
        this.renderRecentTrades();
        this.tablet.showToast('Trading floor refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tradingFloor = new TradingFloor(window.drainedTablet);
});