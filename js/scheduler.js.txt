// SCHEDULER SYSTEM - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class Scheduler {
    constructor(tablet) {
        this.tablet = tablet;
        this.actions = this.loadActions();
        this.init();
    }

    loadActions() {
        const saved = localStorage.getItem('drained_scheduled_actions');
        return saved ? JSON.parse(saved) : [];
    }

    saveActions() {
        localStorage.setItem('drained_scheduled_actions', JSON.stringify(this.actions));
    }

    init() {
        this.createSchedulerHTML();
        this.setupEventListeners();
        this.startScheduler();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'scheduler') {
                this.refresh();
            }
        });
    }

    createSchedulerHTML() {
        const schedulerTab = document.getElementById('tab-scheduler');
        if (!schedulerTab) return;

        schedulerTab.innerHTML = `
            <div class="scheduler-container">
                <div class="scheduler-header">
                    <h2>📅 SCHEDULED ACTIONS</h2>
                    <button id="create-action" class="scheduler-btn primary">+ NEW ACTION</button>
                </div>

                <div class="scheduler-grid">
                    <div class="calendar-view">
                        <h3>CALENDAR</h3>
                        <div id="calendar"></div>
                    </div>

                    <div class="actions-list">
                        <h3>UPCOMING ACTIONS</h3>
                        <div id="actions-container"></div>
                    </div>
                </div>

                <!-- Create Action Modal -->
                <div id="action-modal" class="modal hidden">
                    <div class="modal-content scheduler-modal">
                        <h2>CREATE SCHEDULED ACTION</h2>
                        
                        <div class="form-group">
                            <label>Start Time:</label>
                            <input type="datetime-local" id="action-start">
                        </div>
                        
                        <div class="form-group">
                            <label>End Time (optional):</label>
                            <input type="datetime-local" id="action-end">
                        </div>
                        
                        <div class="form-group">
                            <label>Repeat Every:</label>
                            <select id="action-repeat">
                                <option value="0">No repeat</option>
                                <option value="3600">Every hour</option>
                                <option value="86400">Every day</option>
                                <option value="604800">Every week</option>
                                <option value="2592000">Every month</option>
                                <option value="custom">Custom interval</option>
                            </select>
                        </div>
                        
                        <div class="form-group" id="custom-interval" style="display: none;">
                            <label>Custom interval (seconds):</label>
                            <input type="number" id="action-custom-interval" min="60">
                        </div>
                        
                        <div class="form-group">
                            <label>Repeat Count (0 = infinite):</label>
                            <input type="number" id="action-repeat-count" value="0" min="0">
                        </div>
                        
                        <div class="form-group">
                            <label>Command:</label>
                            <select id="action-command">
                                <option value="say">Say</option>
                                <option value="broadcast">Broadcast</option>
                                <option value="kick">Kick</option>
                                <option value="ban">Ban</option>
                                <option value="event">Trigger Event</option>
                                <option value="restart">Restart Server</option>
                                <option value="wipe">Wipe Server</option>
                                <option value="custom">Custom Command</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Command Parameters:</label>
                            <input type="text" id="action-params" placeholder="e.g., Hello world">
                        </div>
                        
                        <div class="form-group">
                            <label>Custom Command (if selected above):</label>
                            <input type="text" id="action-custom" placeholder="e.g., say Hello">
                        </div>
                        
                        <div class="modal-actions">
                            <button id="save-action" class="scheduler-btn primary">SAVE ACTION</button>
                            <button id="cancel-action" class="scheduler-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderCalendar();
        this.renderActions();
    }

    setupEventListeners() {
        document.getElementById('create-action')?.addEventListener('click', () => {
            document.getElementById('action-modal').classList.remove('hidden');
        });

        document.getElementById('cancel-action')?.addEventListener('click', () => {
            document.getElementById('action-modal').classList.add('hidden');
        });

        document.getElementById('action-repeat')?.addEventListener('change', (e) => {
            const custom = document.getElementById('custom-interval');
            custom.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });

        document.getElementById('save-action')?.addEventListener('click', () => this.saveAction());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-action')) {
                const id = e.target.dataset.id;
                this.deleteAction(id);
            }
        });
    }

    renderCalendar() {
        const calendar = document.getElementById('calendar');
        if (!calendar) return;

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let html = `
            <div class="calendar-header">
                <button class="calendar-nav" id="prev-month">←</button>
                <span>${now.toLocaleString('default', { month: 'long' })} ${year}</span>
                <button class="calendar-nav" id="next-month">→</button>
            </div>
            <table class="calendar-table">
                <tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr>
        `;

        let date = 1;
        for (let i = 0; i < 6; i++) {
            html += '<tr>';
            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDay.getDay()) {
                    html += '<td></td>';
                } else if (date > lastDay.getDate()) {
                    html += '<td></td>';
                } else {
                    const hasAction = this.actions.some(a => {
                        const actionDate = new Date(a.start);
                        return actionDate.getDate() === date && 
                               actionDate.getMonth() === month &&
                               actionDate.getFullYear() === year;
                    });
                    
                    html += `<td class="${hasAction ? 'has-action' : ''}">${date}</td>`;
                    date++;
                }
            }
            html += '</tr>';
            if (date > lastDay.getDate()) break;
        }

        html += '</table>';
        calendar.innerHTML = html;

        // Calendar navigation
        document.getElementById('prev-month')?.addEventListener('click', () => {
            // Would implement month navigation
        });

        document.getElementById('next-month')?.addEventListener('click', () => {
            // Would implement month navigation
        });
    }

    renderActions() {
        const container = document.getElementById('actions-container');
        if (!container) return;

        if (this.actions.length === 0) {
            container.innerHTML = '<div class="no-actions">No scheduled actions</div>';
            return;
        }

        // Sort by start time
        const sorted = [...this.actions].sort((a, b) => new Date(a.start) - new Date(b.start));

        let html = '';
        sorted.forEach(action => {
            const start = new Date(action.start).toLocaleString();
            const nextRun = this.calculateNextRun(action);
            
            html += `
                <div class="action-card ${action.active ? 'active' : 'paused'}">
                    <div class="action-header">
                        <span class="action-command">${action.command}</span>
                        <span class="action-status">${action.active ? '🟢 ACTIVE' : '⏸️ PAUSED'}</span>
                    </div>
                    <div class="action-body">
                        <div><strong>Start:</strong> ${start}</div>
                        ${action.end ? `<div><strong>End:</strong> ${new Date(action.end).toLocaleString()}</div>` : ''}
                        <div><strong>Repeat:</strong> ${this.formatInterval(action.interval)}</div>
                        <div><strong>Remaining:</strong> ${action.count > 0 ? action.count : '∞'}</div>
                        <div><strong>Next run:</strong> ${nextRun.toLocaleString()}</div>
                        <div><strong>Command:</strong> ${action.fullCommand}</div>
                    </div>
                    <div class="action-actions">
                        <button class="action-btn toggle" data-id="${action.id}">
                            ${action.active ? '⏸️ PAUSE' : '▶️ RESUME'}
                        </button>
                        <button class="action-btn edit" data-id="${action.id}">✏️ EDIT</button>
                        <button class="action-btn delete" data-id="${action.id}">🗑️ DELETE</button>
                        <button class="action-btn run" data-id="${action.id}">⚡ RUN NOW</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add event listeners to action buttons
        container.querySelectorAll('.toggle').forEach(btn => {
            btn.addEventListener('click', () => this.toggleAction(btn.dataset.id));
        });

        container.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', () => this.deleteAction(btn.dataset.id));
        });

        container.querySelectorAll('.run').forEach(btn => {
            btn.addEventListener('click', () => this.runAction(btn.dataset.id));
        });
    }

    saveAction() {
        const start = document.getElementById('action-start').value;
        const end = document.getElementById('action-end').value;
        const repeat = document.getElementById('action-repeat').value;
        const repeatCount = parseInt(document.getElementById('action-repeat-count').value);
        const command = document.getElementById('action-command').value;
        const params = document.getElementById('action-params').value;
        const custom = document.getElementById('action-custom').value;

        if (!start) {
            this.tablet.showError('Start time is required');
            return;
        }

        let interval = repeat === 'custom' 
            ? parseInt(document.getElementById('action-custom-interval').value)
            : parseInt(repeat);

        if (isNaN(interval)) interval = 0;

        const fullCommand = command === 'custom' ? custom : `${command} ${params}`.trim();

        const action = {
            id: 'action_' + Date.now(),
            start: new Date(start).toISOString(),
            end: end ? new Date(end).toISOString() : null,
            interval: interval,
            count: repeatCount,
            command: command,
            params: params,
            custom: custom,
            fullCommand: fullCommand,
            active: true,
            createdAt: new Date().toISOString()
        };

        this.actions.push(action);
        this.saveActions();
        this.renderCalendar();
        this.renderActions();

        document.getElementById('action-modal').classList.add('hidden');
        this.tablet.showToast('Action scheduled', 'success');
    }

    deleteAction(id) {
        this.tablet.showConfirm('Delete this scheduled action?', (confirmed) => {
            if (confirmed) {
                this.actions = this.actions.filter(a => a.id !== id);
                this.saveActions();
                this.renderCalendar();
                this.renderActions();
                this.tablet.showToast('Action deleted', 'info');
            }
        });
    }

    toggleAction(id) {
        const action = this.actions.find(a => a.id === id);
        if (action) {
            action.active = !action.active;
            this.saveActions();
            this.renderActions();
            this.tablet.showToast(`Action ${action.active ? 'resumed' : 'paused'}`, 'info');
        }
    }

    runAction(id) {
        const action = this.actions.find(a => a.id === id);
        if (action) {
            this.tablet.showToast(`Executing: ${action.fullCommand}`, 'info');
            // In real version, would send RCON command
            setTimeout(() => {
                this.tablet.showToast('Action executed', 'success');
            }, 1000);
        }
    }

    calculateNextRun(action) {
        const now = new Date();
        const start = new Date(action.start);
        
        if (now < start) return start;
        if (!action.interval || action.interval === 0) return start;

        const elapsed = Math.floor((now - start) / 1000);
        const intervals = Math.floor(elapsed / action.interval);
        const nextRun = new Date(start.getTime() + (intervals + 1) * action.interval * 1000);

        return nextRun;
    }

    formatInterval(seconds) {
        if (!seconds || seconds === 0) return 'No repeat';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours >= 24) {
            const days = Math.floor(hours / 24);
            return `Every ${days} day${days > 1 ? 's' : ''}`;
        }
        if (hours > 0) {
            return `Every ${hours} hour${hours > 1 ? 's' : ''}`;
        }
        if (minutes > 0) {
            return `Every ${minutes} minute${minutes > 1 ? 's' : ''}`;
        }
        return `Every ${seconds} seconds`;
    }

    startScheduler() {
        setInterval(() => {
            const now = new Date();
            
            this.actions.forEach(action => {
                if (!action.active) return;
                
                const nextRun = this.calculateNextRun(action);
                if (nextRun <= now) {
                    this.executeAction(action);
                    
                    // Update count
                    if (action.count > 0) {
                        action.count--;
                        if (action.count === 0) {
                            action.active = false;
                        }
                    }
                }
            });
            
            this.saveActions();
        }, 60000); // Check every minute
    }

    executeAction(action) {
        console.log(`Executing scheduled action: ${action.fullCommand}`);
        // In real version, would send RCON command
    }

    refresh() {
        this.renderCalendar();
        this.renderActions();
        this.tablet.showToast('Scheduler refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.scheduler = new Scheduler(window.drainedTablet);
});