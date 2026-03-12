// echoMemory.js – DRAINED TABLET ULTIMATE v7.0.0
// Persistent server memory system – tracks raids, events, and player legends.
// All original features preserved, now with bridge integration for cross‑session storage.

class EchoMemory {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.db = window.database;
        this.memory = this.loadMemory();
        this.init();
    }

    loadMemory() {
        const saved = localStorage.getItem('tdl_echo_memory');
        return saved ? JSON.parse(saved) : {
            raids: [],
            events: [],
            playerStats: {},
            monumentStats: {},
            legends: [],
            lastWipe: null
        };
    }

    saveMemory() {
        localStorage.setItem('tdl_echo_memory', JSON.stringify(this.memory));
    }

    init() {
        // Listen for raid events from raidDetector
        window.addEventListener('raid-event', (e) => this.recordRaid(e.detail));
        // Listen for server events (cargo, heli, etc.)
        window.addEventListener('server-event', (e) => this.recordServerEvent(e.detail));
        // Periodically prune old data
        setInterval(() => this.pruneMemory(), 3600000); // every hour
    }

    recordRaid(raid) {
        const entry = {
            ...raid,
            timestamp: Date.now()
        };
        this.memory.raids.push(entry);

        // Update player stats
        const attacker = raid.attacker;
        if (!this.memory.playerStats[attacker]) {
            this.memory.playerStats[attacker] = { raids: 0, kills: 0, deaths: 0, headshots: 0 };
        }
        this.memory.playerStats[attacker].raids++;

        // Update monument stats
        const loc = raid.location;
        if (!this.memory.monumentStats[loc]) {
            this.memory.monumentStats[loc] = { raids: 0, events: 0 };
        }
        this.memory.monumentStats[loc].raids++;

        this.saveMemory();
        this.checkLegendary(entry);
    }

    recordServerEvent(event) {
        this.memory.events.push({
            ...event,
            timestamp: Date.now()
        });
        if (event.location) {
            if (!this.memory.monumentStats[event.location]) {
                this.memory.monumentStats[event.location] = { raids: 0, events: 0 };
            }
            this.memory.monumentStats[event.location].events++;
        }
        this.saveMemory();
    }

    checkLegendary(raid) {
        const loc = raid.location;
        const count = this.memory.monumentStats[loc]?.raids || 0;
        if (count === 100 || count === 500 || count === 1000) {
            const legend = {
                type: 'raid milestone',
                monument: loc,
                count: count,
                description: `The ${count}th raid on ${loc} has been recorded!`,
                timestamp: Date.now()
            };
            this.memory.legends.push(legend);
            this.saveMemory();
            // Broadcast to chat via RCON
            if (this.tablet.connected) {
                ConnectionManager.executeCommand(`say [Echo] ${legend.description}`).catch(() => {});
            }
        }
    }

    getHistory(limit = 20) {
        const combined = [
            ...this.memory.raids.map(r => ({ ...r, type: 'raid' })),
            ...this.memory.events.map(e => ({ ...e, type: 'event' })),
            ...this.memory.legends.map(l => ({ ...l, type: 'legend' }))
        ];
        combined.sort((a, b) => b.timestamp - a.timestamp);
        return combined.slice(0, limit);
    }

    getPlayerLegends() {
        const stats = this.memory.playerStats;
        const sorted = Object.entries(stats).sort((a, b) => b[1].raids - a[1].raids);
        return sorted.slice(0, 10).map(([name, data]) => ({ name, ...data }));
    }

    getMonumentStats() {
        return this.memory.monumentStats;
    }

    getTodayInHistory() {
        const today = new Date();
        const month = today.getMonth();
        const day = today.getDate();
        const events = this.memory.events.filter(e => {
            const d = new Date(e.timestamp);
            return d.getMonth() === month && d.getDate() === day;
        });
        return events.slice(0, 10);
    }

    pruneMemory() {
        const oneMonthAgo = Date.now() - 30 * 24 * 3600 * 1000;
        this.memory.raids = this.memory.raids.filter(r => r.timestamp > oneMonthAgo);
        this.memory.events = this.memory.events.filter(e => e.timestamp > oneMonthAgo);
        // Keep legends forever
        this.saveMemory();
    }

    wipeMemory() {
        this.memory = {
            raids: [],
            events: [],
            playerStats: {},
            monumentStats: {},
            legends: [],
            lastWipe: new Date().toISOString()
        };
        this.saveMemory();
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.echoMemory = new EchoMemory();
});