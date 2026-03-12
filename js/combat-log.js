// combat-log.js – DRAINED TABLET ULTIMATE v7.0.0
// Complete combat log system with persistent storage via bridge.
// NO MOCK DATA – all logs come from the bridge database.

class CombatLog {
    constructor() {
        this.tablet = window.drainedTablet;
        this.db = window.database;
        this.currentPlayer = null;
        this.logs = [];
        this.filteredLogs = [];
        this.filters = {
            player: '',
            eventType: 'all',
            weapon: '',
            dateRange: 'all'
        };
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        // Listen for tab changes to refresh when visible
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'combatlog') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-combatlog');
        if (!tab) return;
        tab.innerHTML = `
            <div class="combatlog-container">
                <div class="combatlog-header">
                    <h2>⚔️ COMBAT LOG</h2>
                    <div class="combatlog-controls">
                        <button id="combatlog-refresh" class="combatlog-btn">🔄 REFRESH</button>
                    </div>
                </div>

                <div class="combatlog-search">
                    <input type="text" id="combatlog-player-search" placeholder="Enter PSN ID or Xbox Gamertag...">
                    <button id="combatlog-search-btn" class="combatlog-btn primary">🔍 SEARCH</button>
                </div>

                <div class="combatlog-filters">
                    <select id="combatlog-event-filter">
                        <option value="all">All Events</option>
                        <option value="kill">Kills</option>
                        <option value="death">Deaths</option>
                        <option value="suicide">Suicides</option>
                    </select>
                    <input type="text" id="combatlog-weapon-filter" placeholder="Filter by weapon...">
                    <select id="combatlog-date-filter">
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>

                <div class="combatlog-stats" id="combatlog-stats"></div>

                <div class="combatlog-table-container">
                    <table class="combatlog-table" id="combatlog-table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Event</th>
                                <th>Player</th>
                                <th>Victim</th>
                                <th>Weapon</th>
                                <th>Distance</th>
                            </tr>
                        </thead>
                        <tbody id="combatlog-tbody">
                            <tr><td colspan="6" class="waiting-message">Enter a player name to view combat logs</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    attachEvents() {
        document.getElementById('combatlog-search-btn')?.addEventListener('click', () => this.search());
        document.getElementById('combatlog-player-search')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.search();
        });
        document.getElementById('combatlog-refresh')?.addEventListener('click', () => this.refresh());
        document.getElementById('combatlog-event-filter')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('combatlog-weapon-filter')?.addEventListener('input', () => this.applyFilters());
        document.getElementById('combatlog-date-filter')?.addEventListener('change', () => this.applyFilters());
    }

    async search() {
        const playerInput = document.getElementById('combatlog-player-search').value.trim();
        if (!playerInput) {
            this.tablet.showError('Enter a player PSN ID or Xbox Gamertag');
            return;
        }
        this.currentPlayer = playerInput;
        await this.loadLogs(playerInput);
    }

    async loadLogs(playerId) {
        if (!this.tablet.connected) {
            this.tablet.showError('Not connected to server');
            return;
        }
        const tbody = document.getElementById('combatlog-tbody');
        tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading combat logs...</td></tr>';

        try {
            const logs = await this.db.getCombatLogs(playerId);
            this.logs = logs;
            this.filteredLogs = logs;
            this.applyFilters(); // will render
        } catch (err) {
            console.error('Failed to load combat logs:', err);
            tbody.innerHTML = '<tr><td colspan="6" class="error">Error loading logs</td></tr>';
        }
    }

    applyFilters() {
        const eventType = document.getElementById('combatlog-event-filter').value;
        const weaponFilter = document.getElementById('combatlog-weapon-filter').value.toLowerCase();
        const dateRange = document.getElementById('combatlog-date-filter').value;

        this.filteredLogs = this.logs.filter(log => {
            // Event type filter
            if (eventType !== 'all' && log.event_type !== eventType) return false;
            // Weapon filter
            if (weaponFilter && (!log.weapon || !log.weapon.toLowerCase().includes(weaponFilter))) return false;
            // Date range
            if (dateRange !== 'all') {
                const logTime = log.timestamp;
                const now = Date.now();
                const oneDay = 24 * 60 * 60 * 1000;
                if (dateRange === 'today' && logTime < now - oneDay) return false;
                if (dateRange === 'week' && logTime < now - 7 * oneDay) return false;
                if (dateRange === 'month' && logTime < now - 30 * oneDay) return false;
            }
            return true;
        });

        this.renderLogs();
        this.renderStats();
    }

    renderLogs() {
        const tbody = document.getElementById('combatlog-tbody');
        if (!tbody) return;

        if (this.filteredLogs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-logs">No combat logs found</td></tr>';
            return;
        }

        let html = '';
        this.filteredLogs.forEach(log => {
            const time = new Date(log.timestamp).toLocaleString();
            const eventIcon = log.event_type === 'kill' ? '💀' : log.event_type === 'death' ? '☠️' : '🔪';
            html += `
                <tr>
                    <td>${time}</td>
                    <td>${eventIcon} ${log.event_type}</td>
                    <td>${log.player_name}</td>
                    <td>${log.victim || '-'}</td>
                    <td>${log.weapon || '-'}</td>
                    <td>${log.distance ? log.distance + 'm' : '-'}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }

    renderStats() {
        const statsDiv = document.getElementById('combatlog-stats');
        if (!statsDiv) return;

        const kills = this.filteredLogs.filter(l => l.event_type === 'kill').length;
        const deaths = this.filteredLogs.filter(l => l.event_type === 'death').length;
        const suicides = this.filteredLogs.filter(l => l.event_type === 'suicide').length;
        const kd = deaths ? (kills / deaths).toFixed(2) : kills > 0 ? kills.toFixed(2) : '0.00';

        statsDiv.innerHTML = `
            <div class="stat-card">Kills: <strong>${kills}</strong></div>
            <div class="stat-card">Deaths: <strong>${deaths}</strong></div>
            <div class="stat-card">Suicides: <strong>${suicides}</strong></div>
            <div class="stat-card">K/D: <strong>${kd}</strong></div>
        `;
    }

    refresh() {
        if (this.currentPlayer) {
            this.loadLogs(this.currentPlayer);
        } else {
            const tbody = document.getElementById('combatlog-tbody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="waiting-message">Enter a player name to view combat logs</td></tr>';
        }
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.combatLog = new CombatLog();
});