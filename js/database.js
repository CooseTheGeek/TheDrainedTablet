// database.js – DRAINED TABLET ULTIMATE v7.0.0
// Client‑side interface to the bridge database (combat logs, claims, zones, etc.).
// All data is stored on the bridge (Supabase) and retrieved via API calls.

class Database {
    constructor() {
        this.tablet = window.drainedTablet;
        this.bridgeUrl = AppState.connection.bridgeUrl;
    }

    // ==================== COMBAT LOGS ====================
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

    async removeClaim(claimId) {
        try {
            const res = await fetch(`${this.bridgeUrl}/api/claims/${claimId}`, {
                method: 'DELETE'
            });
            return res.ok;
        } catch (err) {
            console.error('Database.removeClaim error:', err);
            return false;
        }
    }

    // ==================== ZONES ====================
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

document.addEventListener('DOMContentLoaded', () => {
    window.database = new Database();
});