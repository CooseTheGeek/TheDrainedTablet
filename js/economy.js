// economy.js – DRAINED TABLET ULTIMATE v7.0.0
// Economy management: player balances, bounties, quests, and shop.
// Uses bridge for persistent data and RCON for in‑game adjustments.

class Economy {
    constructor() {
        this.tablet = window.drainedTablet;
        this.cmd = window.serverCommands;
        this.access = window.accessControl;
        this.db = window.database;
        this.balances = new Map(); // player -> balance
        this.bounties = [];
        this.quests = [];
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'economy') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-economy');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="economy-container">
                <div class="economy-header">
                    <h2>💰 ECONOMY MANAGER</h2>
                    <button id="economy-refresh" class="economy-btn">🔄 REFRESH</button>
                </div>

                <div class="economy-tabs">
                    <button class="economy-tab active" data-tab="balances">💳 Balances</button>
                    <button class="economy-tab" data-tab="bounties">🎯 Bounties</button>
                    <button class="economy-tab" data-tab="quests">📋 Quests</button>
                    <button class="economy-tab" data-tab="shop">🏪 Shop</button>
                </div>

                <div id="economy-balances" class="economy-tab-content active">
                    <h3>Player Balances</h3>
                    <div class="balance-controls">
                        <input type="text" id="balance-player" placeholder="Player name">
                        <input type="number" id="balance-amount" placeholder="Amount" value="100">
                        <button id="balance-add" class="economy-btn">Add</button>
                        <button id="balance-remove" class="economy-btn">Remove</button>
                        <button id="balance-set" class="economy-btn">Set</button>
                        <button id="balance-check" class="economy-btn">Check</button>
                    </div>
                    <div id="balances-list" class="balances-list"></div>
                </div>

                <div id="economy-bounties" class="economy-tab-content">
                    <h3>Active Bounties</h3>
                    <div class="bounty-controls">
                        <input type="text" id="bounty-target" placeholder="Target player">
                        <input type="number" id="bounty-amount" placeholder="Amount" value="500">
                        <button id="bounty-place" class="economy-btn">Place Bounty</button>
                    </div>
                    <div id="bounties-list" class="bounties-list"></div>
                </div>

                <div id="economy-quests" class="economy-tab-content">
                    <h3>Quests</h3>
                    <div class="quest-controls">
                        <button id="quest-create" class="economy-btn">➕ Create Quest</button>
                    </div>
                    <div id="quests-list" class="quests-list"></div>
                </div>

                <div id="economy-shop" class="economy-tab-content">
                    <h3>Shop Items</h3>
                    <div class="shop-controls">
                        <button id="shop-add" class="economy-btn">➕ Add Item</button>
                    </div>
                    <div id="shop-list" class="shop-list"></div>
                </div>
            </div>
        `;

        this.attachTabListeners();
    }

    attachEvents() {
        document.getElementById('economy-refresh')?.addEventListener('click', () => this.refresh());

        // Balances
        document.getElementById('balance-add')?.addEventListener('click', () => this.adjustBalance('add'));
        document.getElementById('balance-remove')?.addEventListener('click', () => this.adjustBalance('remove'));
        document.getElementById('balance-set')?.addEventListener('click', () => this.adjustBalance('set'));
        document.getElementById('balance-check')?.addEventListener('click', () => this.checkBalance());

        // Bounties
        document.getElementById('bounty-place')?.addEventListener('click', () => this.placeBounty());

        // Quests
        document.getElementById('quest-create')?.addEventListener('click', () => this.createQuest());

        // Shop
        document.getElementById('shop-add')?.addEventListener('click', () => this.addShopItem());
    }

    attachTabListeners() {
        document.querySelectorAll('.economy-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.economy-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.economy-tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`economy-${e.target.dataset.tab}`).classList.add('active');
            });
        });
    }

    async adjustBalance(action) {
        const player = document.getElementById('balance-player').value.trim();
        const amount = parseInt(document.getElementById('balance-amount').value);
        if (!player || isNaN(amount)) {
            this.tablet.showError('Enter player name and amount');
            return;
        }

        let cmd = '';
        switch(action) {
            case 'add': cmd = `economy.add "${player}" ${amount}`; break;
            case 'remove': cmd = `economy.remove "${player}" ${amount}`; break;
            case 'set': cmd = `economy.set "${player}" ${amount}`; break;
        }
        try {
            await ConnectionManager.executeCommand(cmd);
            this.tablet.showToast(`${action} ${amount} for ${player}`, 'success');
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    async checkBalance() {
        const player = document.getElementById('balance-player').value.trim();
        if (!player) return;
        try {
            const result = await ConnectionManager.executeCommand(`economy.balance "${player}"`);
            alert(`${player} balance: ${result}`);
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    async placeBounty() {
        const target = document.getElementById('bounty-target').value.trim();
        const amount = parseInt(document.getElementById('bounty-amount').value);
        if (!target || isNaN(amount)) return;
        try {
            await ConnectionManager.executeCommand(`economy.bounty add "${target}" ${amount}`);
            this.tablet.showToast(`Bounty of ${amount} placed on ${target}`, 'success');
            // Refresh bounties list (not implemented)
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    createQuest() {
        // Simple prompt; could open a modal
        const name = prompt('Quest name:');
        if (!name) return;
        const desc = prompt('Quest description:');
        const reward = prompt('Reward amount:');
        if (!reward) return;
        // Store in bridge (not implemented here)
        this.tablet.showToast('Quest created (bridge storage not implemented)', 'info');
    }

    addShopItem() {
        const name = prompt('Item name:');
        if (!name) return;
        const price = prompt('Price in scrap:');
        if (!price) return;
        // Store in bridge
        this.tablet.showToast('Shop item added (bridge storage not implemented)', 'info');
    }

    refresh() {
        this.tablet.showToast('Economy page refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.economy = new Economy();
});