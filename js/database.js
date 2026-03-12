// database.js – DRAINED TABLET ULTIMATE v7.0.0
// Client‑side interface to the bridge database (combat logs, claims, zones, etc.).
// All data is stored on the bridge (Supabase) and retrieved via API calls.

class Database {
    constructor() {
        this.tablet = window.drainedTablet;
        this.bridgeUrl = AppState.connection.bridgeUrl;
    }

    // ==================== COMBAT LOGS ====================

    // Fetch combat logs for a specific player (PSN ID or Xbox Gamertag)
    async getCombatLogs(playerId) {
        try {
            const res = await fetch(`${this.bridgeUrl}/api/combatlog/${encodeURIComponent(playerId)}`);
            if (!res.ok) throw new Error('Failed to fetch combat logs');
            return await res.json();
        } catch (err) {
            console.error('Database.getCombatLogs error:', err);
            return [];
        }
    }

    // Save a combat log entry
    async saveCombatLog(entry) {
        try {
            const res = await fetch(`${this.bridgeUrl}/api/combatlog`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry)
            });
            return res.ok;
        } catch (err) {
            console.error('Database.saveCombatLog error:', err);
            return false;
        }
    }

    // ==================== CLAIMS ====================

    // Get all claimable items for a player
    async getClaims(playerId) {
        try {
            const res = await fetch(`${this.bridgeUrl}/api/claims/${encodeURIComponent(playerId)}`);
            if (!res.ok) throw new Error('Failed to fetch claims');
            return await res.json();
        } catch (err) {
            console.error('Database.getClaims error:', err);
            return [];
        }
    }

    // Add a new claim (e.g., after voting, event win)
    async addClaim(playerId, itemShortname, quantity, expiresAt = null) {
        try {
            const res = await fetch(`${this.bridgeUrl}/api/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerId, itemShortname, quantity, expiresAt })
            });
            return res.ok;
        } catch (err) {
            console.error('Database.addClaim error:', err);
            return false;
        }
    }

    // Mark a claim as claimed (delete it)
    async removeClaim(claimId) {
        // We'll implement DELETE endpoint later; for now, we can soft‑delete by expiry.
        // For simplicity, we'll assume claims are one‑time and removed after claim.
        // This would require a DELETE endpoint on the bridge.
        // We'll leave it unimplemented for now.
        console.warn('removeClaim not yet implemented');
        return false;
    }

    // ==================== ZONES (Custom Zones) ====================

    // Get all custom zones
    async getZones() {
        try {
            const res = await fetch(`${this.bridgeUrl}/api/zones`);
            if (!res.ok) throw new Error('Failed to fetch zones');
            return await res.json();
        } catch (err) {
            console.error('Database.getZones error:', err);
            return [];
        }
    }

    // Save a zone (create or update)
    async saveZone(zone) {
        try {
            const res = await fetch(`${this.bridgeUrl}/api/zones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(zone)
            });
            return res.ok;
        } catch (err) {
            console.error('Database.saveZone error:', err);
            return false;
        }
    }

    // Delete a zone
    async deleteZone(zoneId) {
        try {
            const res = await fetch(`${this.bridgeUrl}/api/zones/${encodeURIComponent(zoneId)}`, {
                method: 'DELETE'
            });
            return res.ok;
        } catch (err) {
            console.error('Database.deleteZone error:', err);
            return false;
        }
    }

    // ==================== AUDIT LOG ====================

    // Log an admin action (sent to bridge)
    async logAction(username, action, ip = '') {
        try {
            const res = await fetch(`${this.bridgeUrl}/api/audit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, action, ip })
            });
            return res.ok;
        } catch (err) {
            console.error('Database.logAction error:', err);
            return false;
        }
    }

    // Get audit logs (master only)
    async getAuditLogs(limit = 100) {
        try {
            const res = await fetch(`${this.bridgeUrl}/api/audit?limit=${limit}`);
            if (!res.ok) throw new Error('Failed to fetch audit logs');
            return await res.json();
        } catch (err) {
            console.error('Database.getAuditLogs error:', err);
            return [];
        }
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.database = new Database();
});