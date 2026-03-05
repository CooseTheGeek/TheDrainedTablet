// EVENTS TAB - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class EventManager {
    constructor(tablet) {
        this.tablet = tablet;
        this.activeEvents = [];
        this.eventHistory = this.loadHistory();
        this.eventTypes = this.loadEventTypes();
        this.init();
    }

    loadHistory() {
        const saved = localStorage.getItem('drained_event_history');
        return saved ? JSON.parse(saved) : [];
    }

    loadEventTypes() {
        return {
            standard: [
                { name: 'Airdrop', command: 'event_airdrop', icon: '📦', cooldown: 3600 },
                { name: 'Cargo Ship', command: 'event_cargoship', icon: '🚢', cooldown: 7200 },
                { name: 'Cargo Helicopter', command: 'event_cargoheli', icon: '🚁', cooldown: 5400 },
                { name: 'Patrol Helicopter', command: 'event_helicopter', icon: '🚁', cooldown: 3600 },
                { name: 'Bradley APC', command: 'bradley', icon: '💥', cooldown: 7200 }
            ],
            special: [
                { name: 'Halloween', command: 'event_Halloween', icon: '🎃', seasonal: true },
                { name: 'Christmas', command: 'event_Xmas', icon: '🎄', seasonal: true },
                { name: 'Easter', command: 'event_Easter', icon: '🐰', seasonal: true }
            ],
            custom: [
                { name: 'Chinook Drop', command: 'chinook', icon: '🚁' },
                { name: 'Supply Signal', command: 'supply', icon: '📡' },
                { name: 'Locked Crate', command: 'crate', icon: '📦' }
            ]
        };
    }

    init() {
        this.createEventsHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'events') {
                this.refresh();
            }
        });
    }

    createEventsHTML() {
        const eventsTab = document.getElementById('tab-events');
        if (!eventsTab) return;

        eventsTab.innerHTML = `
            <div class="events-container">
                <div class="events-header">
                    <h2>🎉 EVENT MANAGER</h2>
                    <div class="event-controls">
                        <button id="refresh-events" class="event-btn">🔄 REFRESH</button>
                        <button id="event-settings" class="event-btn">⚙️ SETTINGS</button>
                    </div>
                </div>

                <div class="events-grid">
                    <!-- Standard Events -->
                    <div class="events-section">
                        <h3>STANDARD EVENTS</h3>
                        <div class="event-cards" id="standard-events"></div>
                    </div>

                    <!-- Special Events -->
                    <div class="events-section">
                        <h3>SPECIAL EVENTS</h3>
                        <div class="event-cards" id="special-events"></div>
                    </div>

                    <!-- Custom Events -->
                    <div class="events-section">
                        <h3>CUSTOM EVENTS</h3>
                        <div class="event-cards" id="custom-events"></div>
                    </div>
                </div>

                <!-- Active Events Panel -->
                <div class="active-events-panel">
                    <h3>🟢 ACTIVE EVENTS</h3>
                    <div id="active-events" class="active-events-list"></div>
                </div>

                <!-- Event History -->
                <div class="event-history">
                    <h3>📜 EVENT HISTORY</h3>
                    <div id="event-history-list" class="history-list"></div>
                </div>

                <!-- Event Settings Modal -->
                <div id="event-settings-modal" class="modal hidden">
                    <div class="modal-content">
                        <h2>EVENT SETTINGS</h2>
                        
                        <div class="settings-group">
                            <h4>Cargo Ship</h4>
                            <label>Speed Scale: <span id="cargo-speed">1.0</span></label>
                            <input type="range" id="cargo-speed-slider" min="0.5" max="3" step="0.1" value="1.0">
                            
                            <label>Event Duration: <span id="cargo-duration">30</span> min</label>
                            <input type="range" id="cargo-duration-slider" min="10" max="120" value="30">
                            
                            <label>Loot Rounds: <span id="cargo-loot">3</span></label>
                            <input type="range" id="cargo-loot-slider" min="1" max="10" value="3">
                        </div>
                        
                        <div class="settings-group">
                            <h4>Bradley</h4>
                            <label>Respawn Delay: <span id="bradley-delay">30</span> min</label>
                            <input type="range" id="bradley-delay-slider" min="5" max="120" value="30">
                            
                            <label>Quick Respawn:</label>
                            <input type="checkbox" id="bradley-quick" checked>
                        </div>
                        
                        <div class="settings-group">
                            <h4>Helicopter</h4>
                            <label>Accuracy: <span id="heli-accuracy">50</span>%</label>
                            <input type="range" id="heli-accuracy-slider" min="10" max="100" value="50">
                            
                            <label>Damage Scale: <span id="heli-damage">1.0</span></label>
                            <input type="range" id="heli-damage-slider" min="0.1" max="3" step="0.1" value="1.0">
                        </div>
                        
                        <div class="modal-actions">
                            <button id="save-event-settings" class="event-btn primary">SAVE SETTINGS</button>
                            <button id="close-event-settings" class="event-btn">CLOSE</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderEvents();
        this.renderActiveEvents();
        this.renderHistory();
    }

    setupEventListeners() {
        document.getElementById('refresh-events')?.addEventListener('click', () => this.refresh());
        document.getElementById('event-settings')?.addEventListener('click', () => {
            document.getElementById('event-settings-modal').classList.remove('hidden');
        });

        document.getElementById('close-event-settings')?.addEventListener('click', () => {
            document.getElementById('event-settings-modal').classList.add('hidden');
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('trigger-event')) {
                const eventName = e.target.dataset.event;
                this.triggerEvent(eventName);
            }
            if (e.target.classList.contains('stop-event')) {
                const eventId = e.target.dataset.id;
                this.stopEvent(eventId);
            }
        });

        // Settings sliders
        const sliders = [
            { slider: 'cargo-speed-slider', display: 'cargo-speed' },
            { slider: 'cargo-duration-slider', display: 'cargo-duration' },
            { slider: 'cargo-loot-slider', display: 'cargo-loot' },
            { slider: 'bradley-delay-slider', display: 'bradley-delay' },
            { slider: 'heli-accuracy-slider', display: 'heli-accuracy' },
            { slider: 'heli-damage-slider', display: 'heli-damage' }
        ];

        sliders.forEach(item => {
            document.getElementById(item.slider)?.addEventListener('input', (e) => {
                document.getElementById(item.display).innerText = e.target.value;
            });
        });

        document.getElementById('save-event-settings')?.addEventListener('click', () => {
            document.getElementById('event-settings-modal').classList.add('hidden');
            this.tablet.showToast('Event settings saved', 'success');
        });
    }

    renderEvents() {
        // Standard events
        const standardContainer = document.getElementById('standard-events');
        standardContainer.innerHTML = this.eventTypes.standard.map(event => `
            <div class="event-card">
                <div class="event-icon">${event.icon}</div>
                <div class="event-info">
                    <div class="event-name">${event.name}</div>
                    <div class="event-cooldown">Cooldown: ${event.cooldown / 60} min</div>
                </div>
                <div class="event-actions">
                    <button class="trigger-event" data-event="${event.command}">TRIGGER</button>
                </div>
            </div>
        `).join('');

        // Special events
        const specialContainer = document.getElementById('special-events');
        specialContainer.innerHTML = this.eventTypes.special.map(event => `
            <div class="event-card special">
                <div class="event-icon">${event.icon}</div>
                <div class="event-info">
                    <div class="event-name">${event.name}</div>
                    ${event.seasonal ? '<div class="seasonal-tag">Seasonal</div>' : ''}
                </div>
                <div class="event-actions">
                    <button class="trigger-event" data-event="${event.command}">ACTIVATE</button>
                </div>
            </div>
        `).join('');

        // Custom events
        const customContainer = document.getElementById('custom-events');
        customContainer.innerHTML = this.eventTypes.custom.map(event => `
            <div class="event-card">
                <div class="event-icon">${event.icon}</div>
                <div class="event-info">
                    <div class="event-name">${event.name}</div>
                </div>
                <div class="event-actions">
                    <button class="trigger-event" data-event="${event.command}">TRIGGER</button>
                </div>
            </div>
        `).join('');
    }

    renderActiveEvents() {
        const container = document.getElementById('active-events');
        
        if (this.activeEvents.length === 0) {
            container.innerHTML = '<div class="no-active">No active events</div>';
            return;
        }

        container.innerHTML = this.activeEvents.map(event => `
            <div class="active-event">
                <span class="event-icon">${event.icon}</span>
                <span class="event-name">${event.name}</span>
                <span class="event-time">Started: ${new Date(event.started).toLocaleTimeString()}</span>
                <button class="stop-event small-btn" data-id="${event.id}">STOP</button>
            </div>
        `).join('');
    }

    renderHistory() {
        const container = document.getElementById('event-history-list');
        
        if (this.eventHistory.length === 0) {
            container.innerHTML = '<div class="no-history">No event history</div>';
            return;
        }

        container.innerHTML = this.eventHistory.slice(0, 20).map(event => `
            <div class="history-item">
                <span class="history-time">[${new Date(event.time).toLocaleTimeString()}]</span>
                <span class="history-event">${event.icon} ${event.name}</span>
                <span class="history-status ${event.status}">${event.status}</span>
            </div>
        `).join('');
    }

    triggerEvent(eventName) {
        if (!this.tablet.connected) {
            this.tablet.showError('Not connected to server');
            return;
        }

        // Find event details
        let eventDetails = null;
        for (const category in this.eventTypes) {
            const found = this.eventTypes[category].find(e => e.command === eventName);
            if (found) {
                eventDetails = found;
                break;
            }
        }

        if (!eventDetails) return;

        const newEvent = {
            id: 'evt_' + Date.now(),
            name: eventDetails.name,
            icon: eventDetails.icon,
            command: eventName,
            started: new Date().toISOString(),
            status: 'active'
        };

        this.activeEvents.push(newEvent);
        
        // Add to history
        this.eventHistory.unshift({
            ...newEvent,
            time: new Date().toISOString(),
            status: 'triggered'
        });

        this.renderActiveEvents();
        this.renderHistory();
        this.tablet.showToast(`Triggered ${eventDetails.name}`, 'success');
    }

    stopEvent(eventId) {
        const event = this.activeEvents.find(e => e.id === eventId);
        if (event) {
            this.activeEvents = this.activeEvents.filter(e => e.id !== eventId);
            
            this.eventHistory.unshift({
                ...event,
                time: new Date().toISOString(),
                status: 'stopped'
            });

            this.renderActiveEvents();
            this.renderHistory();
            this.tablet.showToast(`Stopped ${event.name}`, 'info');
        }
    }

    refresh() {
        this.renderActiveEvents();
        this.renderHistory();
        this.tablet.showToast('Events refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.eventManager = new EventManager(window.drainedTablet);
});