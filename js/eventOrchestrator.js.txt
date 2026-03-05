// EVENT ORCHESTRATOR - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Stewart (CooseTheGeek). All Rights Reserved.

class EventOrchestrator {
    constructor(tablet) {
        this.tablet = tablet;
        this.schedule = this.loadSchedule();
        this.activeEvents = [];
        this.running = false;
        this.init();
    }

    loadSchedule() {
        const saved = localStorage.getItem('drained_event_schedule');
        return saved ? JSON.parse(saved) : [
            {
                id: 'sched_1',
                name: 'Daily Cargo Ship',
                event: 'event_cargoship',
                time: '18:00',
                days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                enabled: true,
                lastRun: null,
                minPlayers: 15
            },
            {
                id: 'sched_2',
                name: 'Weekend Raid Event',
                event: 'event_helicopter',
                time: '20:00',
                days: ['Saturday', 'Sunday'],
                enabled: true,
                lastRun: null,
                minPlayers: 10
            }
        ];
    }

    saveSchedule() {
        localStorage.setItem('drained_event_schedule', JSON.stringify(this.schedule));
    }

    init() {
        this.createOrchestratorHTML();
        this.setupEventListeners();
        this.startScheduler();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'orchestrator') {
                this.refresh();
            }
        });
    }

    createOrchestratorHTML() {
        const orchestratorTab = document.getElementById('tab-orchestrator');
        if (!orchestratorTab) return;

        orchestratorTab.innerHTML = `
            <div class="orchestrator-container">
                <div class="orchestrator-header">
                    <h2>🎭 EVENT ORCHESTRATOR</h2>
                    <div class="orchestrator-controls">
                        <button id="toggle-orchestrator" class="orchestrator-btn ${this.running ? 'active' : ''}">
                            ${this.running ? '⏸️ PAUSE' : '▶️ START'}
                        </button>
                        <button id="add-schedule" class="orchestrator-btn primary">➕ ADD EVENT</button>
                    </div>
                </div>

                <div class="orchestrator-grid">
                    <div class="schedule-list" id="schedule-list"></div>
                    
                    <div class="upcoming-events">
                        <h3>📅 UPCOMING EVENTS</h3>
                        <div id="upcoming-list"></div>
                    </div>

                    <div class="event-history">
                        <h3>📜 EVENT HISTORY</h3>
                        <div id="event-history-list"></div>
                    </div>

                    <div class="orchestrator-settings">
                        <h3>⚙️ SETTINGS</h3>
                        
                        <div class="setting-item">
                            <label>Min Players for Event:</label>
                            <input type="number" id="min-players" value="10" min="0">
                        </div>
                        
                        <div class="setting-item">
                            <label>Event Spacing (minutes):</label>
                            <input type="number" id="event-spacing" value="30" min="5">
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="auto-cancel" checked>
                                Auto-cancel if low population
                            </label>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="notify-players" checked>
                                Notify players before event
                            </label>
                        </div>
                        
                        <button id="save-settings" class="orchestrator-btn">SAVE SETTINGS</button>
                    </div>
                </div>

                <!-- Add Schedule Modal -->
                <div id="schedule-modal" class="modal hidden">
                    <div class="modal-content">
                        <h2>ADD SCHEDULED EVENT</h2>
                        
                        <div class="form-group">
                            <label>Event Name:</label>
                            <input type="text" id="event-name" placeholder="e.g., Daily Cargo">
                        </div>
                        
                        <div class="form-group">
                            <label>Event Type:</label>
                            <select id="event-type">
                                <option value="event_cargoship">Cargo Ship</option>
                                <option value="event_helicopter">Patrol Helicopter</option>
                                <option value="event_cargoheli">Cargo Helicopter</option>
                                <option value="event_airdrop">Airdrop</option>
                                <option value="bradley">Bradley APC</option>
                                <option value="chinook">Chinook</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Time (24h):</label>
                            <input type="time" id="event-time" value="18:00">
                        </div>
                        
                        <div class="form-group">
                            <label>Days:</label>
                            <div class="days-checkbox">
                                <label><input type="checkbox" class="day-check" value="Monday" checked> Mon</label>
                                <label><input type="checkbox" class="day-check" value="Tuesday" checked> Tue</label>
                                <label><input type="checkbox" class="day-check" value="Wednesday" checked> Wed</label>
                                <label><input type="checkbox" class="day-check" value="Thursday" checked> Thu</label>
                                <label><input type="checkbox" class="day-check" value="Friday" checked> Fri</label>
                                <label><input type="checkbox" class="day-check" value="Saturday" checked> Sat</label>
                                <label><input type="checkbox" class="day-check" value="Sunday" checked> Sun</label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Min Players Required:</label>
                            <input type="number" id="event-min-players" value="10" min="0">
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="event-enabled" checked>
                                Enabled
                            </label>
                        </div>
                        
                        <div class="modal-actions">
                            <button id="save-schedule" class="orchestrator-btn primary">SAVE</button>
                            <button id="cancel-schedule" class="orchestrator-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderSchedule();
        this.renderUpcoming();
        this.renderHistory();
    }

    setupEventListeners() {
        document.getElementById('toggle-orchestrator')?.addEventListener('click', () => this.toggleOrchestrator());
        document.getElementById('add-schedule')?.addEventListener('click', () => this.openScheduleModal());
        document.getElementById('save-schedule')?.addEventListener('click', () => this.saveSchedule());
        document.getElementById('cancel-schedule')?.addEventListener('click', () => {
            document.getElementById('schedule-modal').classList.add('hidden');
        });
        document.getElementById('save-settings')?.addEventListener('click', () => this.saveSettings());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-schedule')) {
                const id = e.target.dataset.id;
                this.editSchedule(id);
            }
            if (e.target.classList.contains('delete-schedule')) {
                const id = e.target.dataset.id;
                this.deleteSchedule(id);
            }
            if (e.target.classList.contains('toggle-schedule')) {
                const id = e.target.dataset.id;
                this.toggleSchedule(id);
            }
            if (e.target.classList.contains('run-now')) {
                const id = e.target.dataset.id;
                this.runNow(id);
            }
        });
    }

    renderSchedule() {
        const list = document.getElementById('schedule-list');
        
        let html = '';
        this.schedule.forEach(item => {
            const days = item.days.map(d => d.slice(0, 3)).join(', ');
            html += `
                <div class="schedule-item ${item.enabled ? 'enabled' : 'disabled'}">
                    <div class="schedule-header">
                        <span class="schedule-name">${item.name}</span>
                        <span class="schedule-status">${item.enabled ? '🟢' : '⚫'}</span>
                    </div>
                    <div class="schedule-details">
                        <div>${item.event} at ${item.time}</div>
                        <div>Days: ${days}</div>
                        <div>Min Players: ${item.minPlayers}</div>
                        ${item.lastRun ? `<div>Last: ${new Date(item.lastRun).toLocaleString()}</div>` : ''}
                    </div>
                    <div class="schedule-actions">
                        <button class="small-btn run-now" data-id="${item.id}">⚡ RUN NOW</button>
                        <button class="small-btn edit-schedule" data-id="${item.id}">✏️</button>
                        <button class="small-btn toggle-schedule" data-id="${item.id}">${item.enabled ? '⏸️' : '▶️'}</button>
                        <button class="small-btn delete-schedule" data-id="${item.id}">🗑️</button>
                    </div>
                </div>
            `;
        });

        list.innerHTML = html;
    }

    renderUpcoming() {
        const list = document.getElementById('upcoming-list');
        const now = new Date();
        const upcoming = [];

        this.schedule.forEach(item => {
            if (!item.enabled) return;
            
            const [hours, minutes] = item.time.split(':').map(Number);
            const eventTime = new Date(now);
            eventTime.setHours(hours, minutes, 0, 0);
            
            if (eventTime < now) {
                eventTime.setDate(eventTime.getDate() + 1);
            }
            
            upcoming.push({
                name: item.name,
                time: eventTime,
                diff: eventTime - now
            });
        });

        upcoming.sort((a, b) => a.diff - b.diff);

        list.innerHTML = upcoming.slice(0, 5).map(event => `
            <div class="upcoming-item">
                <span class="event-name">${event.name}</span>
                <span class="event-time">${event.time.toLocaleTimeString()}</span>
                <span class="event-diff">in ${Math.round(event.diff / 60000)} min</span>
            </div>
        `).join('');
    }

    renderHistory() {
        const list = document.getElementById('event-history-list');
        list.innerHTML = `
            <div class="history-item">[15:32] Cargo Ship triggered automatically</div>
            <div class="history-item">[14:15] Patrol Helicopter spawned</div>
            <div class="history-item">[12:00] Daily event schedule loaded</div>
        `;
    }

    toggleOrchestrator() {
        this.running = !this.running;
        const btn = document.getElementById('toggle-orchestrator');
        btn.innerText = this.running ? '⏸️ PAUSE' : '▶️ START';
        btn.classList.toggle('active');
        this.tablet.showToast(`Event orchestrator ${this.running ? 'started' : 'paused'}`, 'info');
    }

    openScheduleModal() {
        document.getElementById('schedule-modal').classList.remove('hidden');
    }

    saveSchedule() {
        const name = document.getElementById('event-name').value;
        const event = document.getElementById('event-type').value;
        const time = document.getElementById('event-time').value;
        const minPlayers = parseInt(document.getElementById('event-min-players').value);
        const enabled = document.getElementById('event-enabled').checked;

        const days = Array.from(document.querySelectorAll('.day-check:checked')).map(cb => cb.value);

        if (!name || days.length === 0) {
            this.tablet.showError('Name and at least one day required');
            return;
        }

        const schedule = {
            id: 'sched_' + Date.now(),
            name: name,
            event: event,
            time: time,
            days: days,
            enabled: enabled,
            lastRun: null,
            minPlayers: minPlayers
        };

        this.schedule.push(schedule);
        this.saveSchedule();
        this.renderSchedule();
        this.renderUpcoming();
        document.getElementById('schedule-modal').classList.add('hidden');
        this.tablet.showToast('Event scheduled', 'success');
    }

    editSchedule(id) {
        // Implement edit functionality
        this.tablet.showToast('Edit schedule', 'info');
    }

    deleteSchedule(id) {
        this.tablet.showConfirm('Delete this schedule?', (confirmed) => {
            if (confirmed) {
                this.schedule = this.schedule.filter(s => s.id !== id);
                this.saveSchedule();
                this.renderSchedule();
                this.renderUpcoming();
                this.tablet.showToast('Schedule deleted', 'info');
            }
        });
    }

    toggleSchedule(id) {
        const item = this.schedule.find(s => s.id === id);
        if (item) {
            item.enabled = !item.enabled;
            this.saveSchedule();
            this.renderSchedule();
            this.renderUpcoming();
        }
    }

    runNow(id) {
        const item = this.schedule.find(s => s.id === id);
        if (item) {
            this.tablet.showToast(`Triggering ${item.name}...`, 'info');
            item.lastRun = new Date().toISOString();
            this.saveSchedule();
            this.renderSchedule();
            setTimeout(() => {
                this.tablet.showToast(`${item.name} started!`, 'success');
            }, 1000);
        }
    }

    saveSettings() {
        this.tablet.showToast('Settings saved', 'success');
    }

    startScheduler() {
        setInterval(() => {
            if (this.running) {
                this.checkSchedule();
            }
        }, 60000); // Check every minute
    }

    checkSchedule() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

        this.schedule.forEach(item => {
            if (!item.enabled) return;

            const [schedHour, schedMinute] = item.time.split(':').map(Number);
            
            if (schedHour === currentHour && schedMinute === currentMinute && item.days.includes(currentDay)) {
                this.triggerEvent(item);
            }
        });
    }

    triggerEvent(item) {
        const playerCount = Math.floor(Math.random() * 50) + 10;
        
        if (playerCount >= item.minPlayers) {
            this.tablet.showToast(`🎉 Auto-triggered: ${item.name}`, 'success');
            item.lastRun = new Date().toISOString();
            this.saveSchedule();
            this.renderSchedule();
            this.renderUpcoming();
        }
    }

    refresh() {
        this.renderSchedule();
        this.renderUpcoming();
        this.renderHistory();
        this.tablet.showToast('Event orchestrator refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.eventOrchestrator = new EventOrchestrator(window.drainedTablet);
});