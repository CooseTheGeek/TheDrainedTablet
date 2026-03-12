// events.js – DRAINED TABLET ULTIMATE v7.0.0
// Event manager: trigger and configure server events.
// Supports airdrop, helicopter, cargo ship, Bradley, and custom events.

class Events {
    constructor() {
        this.tablet = window.drainedTablet;
        this.cmd = window.serverCommands;
        this.access = window.accessControl;
        this.eventCooldowns = {}; // will hold current cooldown multipliers
        this.activeEvents = [];
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'events') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-events');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="events-container">
                <div class="events-header">
                    <h2>🎉 EVENT MANAGER</h2>
                    <button id="events-refresh" class="events-btn">🔄 REFRESH</button>
                </div>

                <div class="events-grid">
                    <div class="events-section">
                        <h3>📦 Airdrop</h3>
                        <button class="event-trigger" data-event="airdrop">Drop Airdrop</button>
                        <div class="cooldown-setting">
                            <label>Cooldown Multiplier: <span id="cooldown-airdrop">1.0</span></label>
                            <input type="range" id="airdrop-cooldown" min="0.1" max="5" step="0.1" value="1.0">
                        </div>
                    </div>

                    <div class="events-section">
                        <h3>🚁 Patrol Helicopter</h3>
                        <button class="event-trigger" data-event="heli">Call Heli</button>
                        <div class="cooldown-setting">
                            <label>Cooldown Multiplier: <span id="cooldown-heli">1.0</span></label>
                            <input type="range" id="heli-cooldown" min="0.1" max="5" step="0.1" value="1.0">
                        </div>
                    </div>

                    <div class="events-section">
                        <h3>🚢 Cargo Ship</h3>
                        <button class="event-trigger" data-event="cargo">Call Cargo</button>
                        <div class="cooldown-setting">
                            <label>Cooldown Multiplier: <span id="cooldown-cargo">1.0</span></label>
                            <input type="range" id="cargo-cooldown" min="0.1" max="5" step="0.1" value="1.0">
                        </div>
                    </div>

                    <div class="events-section">
                        <h3>💥 Bradley APC</h3>
                        <button class="event-trigger" data-event="bradley">Spawn Bradley</button>
                        <div class="cooldown-setting">
                            <label>Cooldown Multiplier: <span id="cooldown-bradley">1.0</span></label>
                            <input type="range" id="bradley-cooldown" min="0.1" max="5" step="0.1" value="1.0">
                        </div>
                    </div>
                </div>

                <div class="active-events-panel">
                    <h3>🟢 ACTIVE EVENTS</h3>
                    <div id="active-events-list">No active events</div>
                </div>

                <div class="event-history-panel">
                    <h3>📜 EVENT HISTORY</h3>
                    <div id="event-history-list">No recent events</div>
                </div>

                <div class="events-actions">
                    <button id="apply-cooldowns" class="events-btn primary">APPLY COOLDOWNS</button>
                </div>
            </div>
        `;

        this.attachRangeListeners();
    }

    attachEvents() {
        document.getElementById('events-refresh')?.addEventListener('click', () => this.refresh());
        document.getElementById('apply-cooldowns')?.addEventListener('click', () => this.applyCooldowns());

        document.querySelectorAll('.event-trigger').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const event = e.target.dataset.event;
                await this.triggerEvent(event);
            });
        });
    }

    attachRangeListeners() {
        ['airdrop', 'heli', 'cargo', 'bradley'].forEach(event => {
            const input = document.getElementById(event + '-cooldown');
            if (input) {
                input.addEventListener('input', () => {
                    const span = document.getElementById('cooldown-' + event);
                    if (span) span.innerText = input.value;
                });
            }
        });
    }

    async triggerEvent(event) {
        try {
            switch(event) {
                case 'airdrop':
                    await this.cmd.triggerAirdrop();
                    break;
                case 'heli':
                    await this.cmd.triggerHeli();
                    break;
                case 'cargo':
                    await this.cmd.triggerCargo();
                    break;
                case 'bradley':
                    await this.cmd.triggerBradley();
                    break;
                default:
                    this.tablet.showError('Unknown event');
                    return;
            }
            this.tablet.showToast(`Event ${event} triggered`, 'success');
            // Add to active events (simulate)
            this.activeEvents.push({ name: event, time: Date.now() });
            this.renderActiveEvents();
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    async applyCooldowns() {
        const airdrop = document.getElementById('airdrop-cooldown').value;
        const heli = document.getElementById('heli-cooldown').value;
        const cargo = document.getElementById('cargo-cooldown').value;
        const bradley = document.getElementById('bradley-cooldown').value;

        try {
            await this.cmd.setEventCooldown('event_airdrop', airdrop);
            await this.cmd.setEventCooldown('event_helicopter', heli);
            await this.cmd.setEventCooldown('event_cargoship', cargo);
            await this.cmd.setEventCooldown('bradley', bradley);
            this.tablet.showToast('Cooldowns applied', 'success');
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    renderActiveEvents() {
        const list = document.getElementById('active-events-list');
        if (!list) return;
        if (this.activeEvents.length === 0) {
            list.innerHTML = 'No active events';
            return;
        }
        let html = '';
        this.activeEvents.forEach(e => {
            const time = new Date(e.time).toLocaleTimeString();
            html += `<div class="active-event">${e.name} (started ${time})</div>`;
        });
        list.innerHTML = html;
    }

    refresh() {
        // In a real implementation, you might fetch current event status from server
        this.tablet.showToast('Events page refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.events = new Events();
});