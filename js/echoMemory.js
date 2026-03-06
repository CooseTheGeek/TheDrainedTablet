// ECHO MEMORY - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.
// Persistent server memory system – tracks raids, events, and player legends.
// No mock data – all data comes from real RCON events.

class EchoMemory {
    constructor(tablet) {
        this.tablet = tablet;
        this.memory = this.loadMemory();
        this.init();
    }

    loadMemory() {
        const saved = localStorage.getItem('drained_echo_memory');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse echo memory', e);
            }
        }
        // Default structure
        return {
            raids: [],                // list of raid events
            events: [],               // server events (cargo, heli, etc.)
            playerStats: {},          // aggregated player stats (kills, raids, etc.)
            monumentStats: {},         // activity per monument
            legends: [],              // generated legendary events
            lastWipe: null,            // date of last wipe
        };
    }

    saveMemory() {
        localStorage.setItem('drained_echo_memory', JSON.stringify(this.memory));
    }

    init() {
        // Listen for raid events from raidDetector
        window.addEventListener('raid-event', (e) => this.recordRaid(e.detail));
        // Listen for server events (cargo, heli, etc.)
        window.addEventListener('server-event', (e) => this.recordServerEvent(e.detail));
        // Listen for player kills/deaths? (optional)
        // Could be expanded

        // Periodically prune old data (keep last 1000 raids, etc.)
        setInterval(() => this.pruneMemory(), 3600000); // every hour
    }

    recordRaid(raid) {
        // raid object: { location, attacker, time, explosives, participants? }
        this.memory.raids.push({
            ...raid,
            timestamp: Date.now(),
        });
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
        this.checkLegendary(raid);
    }

    recordServerEvent(event) {
        // event: { type, location, time, ... }
        this.memory.events.push({
            ...event,
            timestamp: Date.now(),
        });
        if (event.location) {
            if (!this.memory.monumentStats[event.location]) {
                this.memory.monumentStats[event.location] = { raids: 0, events: 0 };
            }
            this.memory.monumentStats[event.location].events++;
        }
        this.saveMemory();
    }

    // Check if an event is "legendary" (e.g., 100th raid at Dome)
    checkLegendary(raid) {
        const loc = raid.location;
        const count = this.memory.monumentStats[loc]?.raids || 0;
        if (count === 100 || count === 500 || count === 1000) {
            const legend = {
                type: 'raid milestone',
                monument: loc,
                count: count,
                description: `The ${count}th raid on ${loc} has been recorded!`,
                timestamp: Date.now(),
            };
            this.memory.legends.push(legend);
            this.saveMemory();
            // Broadcast to chat via RCON
            this.tablet.sendCommand(`say [Echo] ${legend.description}`);
        }
    }

    // Get history for Chronicle tab
    getHistory(limit = 20) {
        // Combine raids and events, sort by timestamp descending
        const combined = [
            ...this.memory.raids.map(r => ({ ...r, type: 'raid' })),
            ...this.memory.events.map(e => ({ ...e, type: 'event' })),
            ...this.memory.legends.map(l => ({ ...l, type: 'legend' })),
        ];
        combined.sort((a, b) => b.timestamp - a.timestamp);
        return combined.slice(0, limit);
    }

    // Get player legends (top raiders, etc.)
    getPlayerLegends() {
        const stats = this.memory.playerStats;
        const sorted = Object.entries(stats).sort((a, b) => b[1].raids - a[1].raids);
        return sorted.slice(0, 10).map(([name, data]) => ({ name, ...data }));
    }

    // Get monument stats
    getMonumentStats() {
        return this.memory.monumentStats;
    }

    // Get today in history (events that happened on this date in previous years)
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

    // Prune old data to prevent storage overflow
    pruneMemory() {
        const oneMonthAgo = Date.now() - 30 * 24 * 3600 * 1000;
        this.memory.raids = this.memory.raids.filter(r => r.timestamp > oneMonthAgo);
        this.memory.events = this.memory.events.filter(e => e.timestamp > oneMonthAgo);
        // Keep legends forever (they're special)
        this.saveMemory();
    }

    // Wipe memory (called after server wipe)
    wipeMemory() {
        this.memory = {
            raids: [],
            events: [],
            playerStats: {},
            monumentStats: {},
            legends: [],
            lastWipe: new Date().toISOString(),
        };
        this.saveMemory();
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.echoMemory = new EchoMemory(window.drainedTablet);
});