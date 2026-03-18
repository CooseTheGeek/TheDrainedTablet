// claim-system.js – DRAINED TABLET ULTIMATE v7.0.0
// Anti‑exploit claim system for rewards (kits, items, etc.).
// Uses bridge database for persistence and RCON for delivery.
// UPDATED: uses platformId for player identification.

class ClaimSystem {
    constructor() {
        this.tablet = window.drainedTablet;
        this.db = window.database;
        this.claims = [];
        this.deliveryMethods = ['inventory', 'ground', 'mailbox'];
        this.userPref = localStorage.getItem('tdl_claim_pref') || 'inventory';
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        // Refresh when tab becomes visible
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'claims') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-claims');
        if (!tab) return;
        tab.innerHTML = `
            <div class="claims-container">
                <div class="claims-header">
                    <h2>📦 CLAIM CENTER</h2>
                </div>

                <div class="claims-preferences">
                    <h3>⚙️ DELIVERY PREFERENCE</h3>
                    <select id="claim-delivery-method">
                        <option value="inventory" ${this.userPref === 'inventory' ? 'selected' : ''}>Deliver to inventory (if space available)</option>
                        <option value="ground" ${this.userPref === 'ground' ? 'selected' : ''}>Drop on ground at my location</option>
                        <option value="mailbox" ${this.userPref === 'mailbox' ? 'selected' : ''}>Send to in‑game mailbox</option>
                    </select>
                    <button id="save-claim-pref" class="claim-btn">💾 SAVE PREFERENCE</button>
                </div>

                <div class="claims-list-header">
                    <h3>🎁 YOUR CLAIMABLE ITEMS</h3>
                    <button id="refresh-claims" class="claim-btn">🔄 REFRESH</button>
                </div>

                <div id="claims-list" class="claims-list">
                    <div class="loading">Loading claims...</div>
                </div>

                <div class="claims-actions">
                    <button id="claim-all" class="claim-btn primary">✅ CLAIM ALL</button>
                    <button id="claim-selected" class="claim-btn">📦 CLAIM SELECTED</button>
                </div>
            </div>
        `;
    }

    attachEvents() {
        document.getElementById('save-claim-pref')?.addEventListener('click', () => this.savePreference());
        document.getElementById('refresh-claims')?.addEventListener('click', () => this.refresh());
        document.getElementById('claim-all')?.addEventListener('click', () => this.claimAll());
        document.getElementById('claim-selected')?.addEventListener('click', () => this.claimSelected());
    }

    async savePreference() {
        const method = document.getElementById('claim-delivery-method').value;
        this.userPref = method;
        localStorage.setItem('tdl_claim_pref', method);
        this.tablet.showToast('Delivery preference saved', 'success');
    }

    async refresh() {
        if (!this.tablet.connected) {
            this.tablet.showError('Not connected to server');
            return;
        }
        const playerId = AppState.user.platformId;
        if (!playerId) {
            this.tablet.showError('No platform ID set in profile');
            return;
        }
        const listDiv = document.getElementById('claims-list');
        listDiv.innerHTML = '<div class="loading">Loading claims...</div>';
        try {
            const claims = await this.db.getClaims(playerId);
            this.claims = claims;
            this.renderClaims();
        } catch (err) {
            listDiv.innerHTML = '<div class="error">Failed to load claims</div>';
        }
    }

    renderClaims() {
        const listDiv = document.getElementById('claims-list');
        if (!listDiv) return;
        if (this.claims.length === 0) {
            listDiv.innerHTML = '<div class="no-claims">No claimable items</div>';
            return;
        }
        let html = '<table class="claims-table"><tr><th>Select</th><th>Item</th><th>Quantity</th><th>Expires</th><th>Action</th></tr>';
        this.claims.forEach((claim, index) => {
            const expires = claim.expires_at ? new Date(claim.expires_at).toLocaleDateString() : 'Never';
            html += `
                <tr>
                    <td><input type="checkbox" class="claim-select" data-index="${index}"></td>
                    <td>${claim.item_shortname}</td>
                    <td>${claim.quantity}</td>
                    <td>${expires}</td>
                    <td><button class="claim-now small-btn" data-index="${index}">CLAIM</button></td>
                </tr>
            `;
        });
        html += '</table>';
        listDiv.innerHTML = html;

        listDiv.querySelectorAll('.claim-now').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                this.claimOne(index);
            });
        });
    }

    async claimOne(index) {
        const claim = this.claims[index];
        if (!claim) return;
        // Anti‑exploit: check rate limit, duplicate prevention on bridge side
        try {
            await this.deliverItem(claim);
            // Remove from list and optionally from database
            this.claims.splice(index, 1);
            this.renderClaims();
            this.tablet.showToast('Item claimed!', 'success');
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    async claimAll() {
        if (this.claims.length === 0) return;
        const succeeded = [];
        for (let i = this.claims.length - 1; i >= 0; i--) {
            try {
                await this.deliverItem(this.claims[i]);
                this.claims.splice(i, 1);
                succeeded.push(this.claims[i]?.item_shortname);
            } catch (err) {
                console.error('Claim failed:', err);
            }
        }
        this.renderClaims();
        if (succeeded.length > 0) {
            this.tablet.showToast(`Claimed ${succeeded.length} item(s)`, 'success');
        }
    }

    claimSelected() {
        const checkboxes = document.querySelectorAll('.claim-select:checked');
        if (checkboxes.length === 0) {
            this.tablet.showError('No items selected');
            return;
        }
        const indices = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
        // Sort descending so removal doesn't shift indices
        indices.sort((a,b) => b - a);
        let claimedCount = 0;
        for (let idx of indices) {
            const claim = this.claims[idx];
            if (claim) {
                this.deliverItem(claim).then(() => {
                    this.claims.splice(idx, 1);
                    claimedCount++;
                }).catch(err => {
                    this.tablet.showError(`Failed: ${err.message}`);
                });
            }
        }
        setTimeout(() => {
            this.renderClaims();
            if (claimedCount > 0) this.tablet.showToast(`Claimed ${claimedCount} item(s)`, 'success');
        }, 500);
    }

    async deliverItem(claim) {
        // Determine delivery method
        const method = this.userPref;
        // Use platformId as the in-game player identifier
        const playerId = AppState.user.platformId;
        if (!playerId) throw new Error('No platform ID');

        let command = '';
        switch (method) {
            case 'inventory':
                command = `inventory.giveplayer "${playerId}" ${claim.item_shortname} ${claim.quantity}`;
                break;
            case 'ground':
                command = `spawn "${claim.item_shortname}" ${claim.quantity}`;
                break;
            case 'mailbox':
                // Requires a mailbox plugin; fallback to ground
                command = `spawn "${claim.item_shortname}" ${claim.quantity}`;
                break;
            default:
                command = `inventory.giveplayer "${playerId}" ${claim.item_shortname} ${claim.quantity}`;
        }

        try {
            const result = await ConnectionManager.executeCommand(command);
            // After successful delivery, remove from database
            await this.db.removeClaim(claim.id); // We'll need to implement this
            return result;
        } catch (err) {
            throw new Error(`Delivery failed: ${err.message}`);
        }
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.claimSystem = new ClaimSystem();
});