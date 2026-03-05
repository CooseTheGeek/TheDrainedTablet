// ECONOMY SYSTEM - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class EconomySystem {
    constructor(tablet) {
        this.tablet = tablet;
        this.players = new Map();
        this.transactions = this.loadTransactions();
        this.init();
    }

    loadTransactions() {
        const saved = localStorage.getItem('drained_economy_transactions');
        return saved ? JSON.parse(saved) : [];
    }

    saveTransactions() {
        localStorage.setItem('drained_economy_transactions', JSON.stringify(this.transactions.slice(0, 200)));
    }

    init() {
        this.createEconomyHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'economy') {
                this.refresh();
            }
        });
    }

    createEconomyHTML() {
        const economyTab = document.getElementById('tab-economy');
        if (!economyTab) return;

        economyTab.innerHTML = `
            <div class="economy-container">
                <div class="economy-header">
                    <h2>💰 ECONOMY SYSTEM</h2>
                    <div class="economy-controls">
                        <button id="refresh-economy" class="economy-btn">🔄 REFRESH</button>
                        <button id="clear-transactions" class="economy-btn">🗑️ CLEAR LOGS</button>
                    </div>
                </div>

                <div class="economy-tabs">
                    <button class="economy-tab active" data-tab="balances">💳 BALANCES</button>
                    <button class="economy-tab" data-tab="spin">🎰 SPIN WHEEL</button>
                    <button class="economy-tab" data-tab="settings">⚙️ SETTINGS</button>
                    <button class="economy-tab" data-tab="history">📜 HISTORY</button>
                </div>

                <div id="balances-tab" class="economy-tab-content active">
                    <div class="balances-header">
                        <input type="text" id="balance-search" placeholder="Search player...">
                        <button id="add-balance" class="economy-btn">➕ ADD FUNDS</button>
                    </div>
                    <div class="balances-list" id="balances-list"></div>
                </div>

                <div id="spin-tab" class="economy-tab-content">
                    <div class="spin-wheel-container">
                        <div class="wheel-of-fate">
                            <div class="wheel" id="wheel">
                                <div class="wheel-segment yellow" data-color="yellow" data-mult="2">2x</div>
                                <div class="wheel-segment green" data-color="green" data-mult="3">3x</div>
                                <div class="wheel-segment blue" data-color="blue" data-mult="5">5x</div>
                                <div class="wheel-segment purple" data-color="purple" data-mult="10">10x</div>
                                <div class="wheel-segment red" data-color="red" data-mult="20">20x</div>
                            </div>
                            <div class="wheel-pointer">▼</div>
                        </div>

                        <div class="spin-controls">
                            <div class="form-group">
                                <label>Player:</label>
                                <input type="text" id="spin-player" placeholder="Player name">
                            </div>
                            <div class="form-group">
                                <label>Bet Amount:</label>
                                <input type="number" id="spin-bet" value="100" min="1">
                            </div>
                            <div class="color-selector">
                                <label>Pick Color:</label>
                                <div class="color-buttons">
                                    <button class="color-btn yellow" data-color="yellow">YELLOW (2x)</button>
                                    <button class="color-btn green" data-color="green">GREEN (3x)</button>
                                    <button class="color-btn blue" data-color="blue">BLUE (5x)</button>
                                    <button class="color-btn purple" data-color="purple">PURPLE (10x)</button>
                                    <button class="color-btn red" data-color="red">RED (20x)</button>
                                </div>
                            </div>
                            <div class="bet-multipliers">
                                <button class="multiplier-btn" data-mult="1">1x</button>
                                <button class="multiplier-btn" data-mult="10">10x</button>
                                <button class="multiplier-btn" data-mult="100">100x</button>
                            </div>
                            <button id="spin-btn" class="economy-btn primary big">🎰 SPIN!</button>
                        </div>

                        <div class="spin-result" id="spin-result"></div>
                    </div>
                </div>

                <div id="settings-tab" class="economy-tab-content">
                    <div class="economy-settings">
                        <h3>EARNING RATES</h3>
                        <div class="setting-item">
                            <label>Kill Reward:</label>
                            <input type="number" id="kill-reward" value="50" min="0">
                            <span>scrap</span>
                        </div>
                        <div class="setting-item">
                            <label>Ore Gather:</label>
                            <input type="number" id="ore-reward" value="1" min="0">
                            <span>scrap per 1000</span>
                        </div>
                        <div class="setting-item">
                            <label>Playtime:</label>
                            <input type="number" id="playtime-reward" value="10" min="0">
                            <span>scrap per hour</span>
                        </div>
                        <div class="setting-item">
                            <label>Vote Reward:</label>
                            <input type="number" id="vote-reward" value="500" min="0">
                            <span>scrap</span>
                        </div>

                        <h3>WHEEL SETTINGS</h3>
                        <div class="setting-item">
                            <label>Yellow Multiplier:</label>
                            <input type="number" id="yellow-mult" value="2" min="1">
                        </div>
                        <div class="setting-item">
                            <label>Green Multiplier:</label>
                            <input type="number" id="green-mult" value="3" min="1">
                        </div>
                        <div class="setting-item">
                            <label>Blue Multiplier:</label>
                            <input type="number" id="blue-mult" value="5" min="1">
                        </div>
                        <div class="setting-item">
                            <label>Purple Multiplier:</label>
                            <input type="number" id="purple-mult" value="10" min="1">
                        </div>
                        <div class="setting-item">
                            <label>Red Multiplier:</label>
                            <input type="number" id="red-mult" value="20" min="1">
                        </div>

                        <button id="save-economy-settings" class="economy-btn primary">SAVE SETTINGS</button>
                    </div>
                </div>

                <div id="history-tab" class="economy-tab-content">
                    <div class="transaction-history" id="transaction-history"></div>
                </div>
            </div>
        `;

        this.renderBalances();
        this.renderHistory();
    }

    setupEventListeners() {
        document.querySelectorAll('.economy-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.economy-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.economy-tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(e.target.dataset.tab + '-tab').classList.add('active');
            });
        });

        document.getElementById('refresh-economy')?.addEventListener('click', () => this.refresh());
        document.getElementById('clear-transactions')?.addEventListener('click', () => this.clearTransactions());
        document.getElementById('add-balance')?.addEventListener('click', () => this.addFunds());
        document.getElementById('balance-search')?.addEventListener('input', () => this.renderBalances());

        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedColor = e.target.dataset.color;
            });
        });

        document.querySelectorAll('.multiplier-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bet = document.getElementById('spin-bet');
                bet.value = parseInt(bet.value) * parseInt(e.target.dataset.mult);
            });
        });

        document.getElementById('spin-btn')?.addEventListener('click', () => this.spinWheel());
        document.getElementById('save-economy-settings')?.addEventListener('click', () => this.saveSettings());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('give-funds')) {
                const player = e.target.dataset.player;
                this.giveFunds(player);
            }
            if (e.target.classList.contains('take-funds')) {
                const player = e.target.dataset.player;
                this.takeFunds(player);
            }
            if (e.target.classList.contains('set-funds')) {
                const player = e.target.dataset.player;
                this.setFunds(player);
            }
        });
    }

    renderBalances() {
        const container = document.getElementById('balances-list');
        const search = document.getElementById('balance-search')?.value.toLowerCase() || '';

        // Mock player data
        const players = [
            { name: 'RustGod', cash: 5420, bank: 12000 },
            { name: 'BuilderBob', cash: 2150, bank: 8500 },
            { name: 'PvPKing', cash: 8450, bank: 3000 },
            { name: 'RaiderSue', cash: 3200, bank: 5000 }
        ];

        const filtered = players.filter(p => p.name.toLowerCase().includes(search));

        let html = '<table class="balances-table">';
        html += '<tr><th>Player</th><th>Cash</th><th>Bank</th><th>Total</th><th>Actions</th></tr>';

        filtered.forEach(p => {
            html += `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.cash}</td>
                    <td>${p.bank}</td>
                    <td>${p.cash + p.bank}</td>
                    <td>
                        <button class="small-btn give-funds" data-player="${p.name}">➕</button>
                        <button class="small-btn take-funds" data-player="${p.name}">➖</button>
                        <button class="small-btn set-funds" data-player="${p.name}">✏️</button>
                    </td>
                </tr>
            `;
        });

        html += '</table>';
        container.innerHTML = html;
    }

    renderHistory() {
        const container = document.getElementById('transaction-history');

        if (this.transactions.length === 0) {
            container.innerHTML = '<div class="no-history">No transaction history</div>';
            return;
        }

        let html = '<table class="history-table">';
        html += '<tr><th>Time</th><th>Player</th><th>Type</th><th>Amount</th><th>Balance</th></tr>';

        this.transactions.slice(0, 50).forEach(t => {
            html += `
                <tr>
                    <td>${new Date(t.time).toLocaleTimeString()}</td>
                    <td>${t.player}</td>
                    <td>${t.type}</td>
                    <td>${t.amount > 0 ? '+' : ''}${t.amount}</td>
                    <td>${t.balance}</td>
                </tr>
            `;
        });

        html += '</table>';
        container.innerHTML = html;
    }

    spinWheel() {
        const player = document.getElementById('spin-player').value;
        const bet = parseInt(document.getElementById('spin-bet').value);
        const color = this.selectedColor;

        if (!player || !bet || !color) {
            this.tablet.showError('Enter player, bet amount, and pick a color');
            return;
        }

        const colors = ['yellow', 'green', 'blue', 'purple', 'red'];
        const result = colors[Math.floor(Math.random() * colors.length)];
        const multipliers = {
            yellow: 2, green: 3, blue: 5, purple: 10, red: 20
        };

        const win = result === color;
        const winnings = win ? bet * multipliers[color] : 0;

        const resultDiv = document.getElementById('spin-result');
        resultDiv.innerHTML = `
            <div class="spin-result-content ${win ? 'win' : 'lose'}">
                <h3>${win ? '🎉 YOU WIN!' : '😢 BETTER LUCK NEXT TIME'}</h3>
                <p>Result: ${result.toUpperCase()} (${multipliers[result]}x)</p>
                ${win ? `<p>You won ${winnings} scrap!</p>` : `<p>You lost ${bet} scrap</p>`}
            </div>
        `;

        this.addTransaction({
            player: player,
            type: 'spin',
            amount: win ? winnings : -bet,
            balance: 0, // Would need actual balance
            time: new Date().toISOString()
        });

        this.tablet.showToast(`${player} ${win ? 'won' : 'lost'} at the wheel`, win ? 'success' : 'info');
    }

    giveFunds(player) {
        const amount = prompt(`Enter amount to give to ${player}:`);
        if (amount) {
            this.addTransaction({
                player: player,
                type: 'give',
                amount: parseInt(amount),
                balance: 0,
                time: new Date().toISOString()
            });
            this.tablet.showToast(`Gave ${amount} scrap to ${player}`, 'success');
        }
    }

    takeFunds(player) {
        const amount = prompt(`Enter amount to take from ${player}:`);
        if (amount) {
            this.addTransaction({
                player: player,
                type: 'take',
                amount: -parseInt(amount),
                balance: 0,
                time: new Date().toISOString()
            });
            this.tablet.showToast(`Took ${amount} scrap from ${player}`, 'info');
        }
    }

    setFunds(player) {
        const amount = prompt(`Set ${player}'s balance to:`);
        if (amount) {
            this.addTransaction({
                player: player,
                type: 'set',
                amount: parseInt(amount),
                balance: parseInt(amount),
                time: new Date().toISOString()
            });
            this.tablet.showToast(`Set ${player}'s balance to ${amount}`, 'success');
        }
    }

    addFunds() {
        const player = prompt('Enter player name:');
        if (player) this.giveFunds(player);
    }

    addTransaction(transaction) {
        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.renderHistory();
    }

    clearTransactions() {
        this.tablet.showConfirm('Clear transaction history?', (confirmed) => {
            if (confirmed) {
                this.transactions = [];
                this.saveTransactions();
                this.renderHistory();
                this.tablet.showToast('Transaction history cleared', 'info');
            }
        });
    }

    saveSettings() {
        this.tablet.showToast('Economy settings saved', 'success');
    }

    refresh() {
        this.renderBalances();
        this.renderHistory();
        this.tablet.showToast('Economy system refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.economySystem = new EconomySystem(window.drainedTablet);
});