// global.js – DRAINED TABLET ULTIMATE v7.0.0
// Global command executor: category browser, favorites, command history, parameter input.
// All original features preserved, now with enhanced UI and RCON integration.

class Global {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.favorites = this.loadFavorites();
        this.history = this.loadHistory();
        this.commands = this.defineCommands();
        this.currentCategory = 'all';
        this.init();
    }

    defineCommands() {
        return {
            admin: [
                { cmd: 'server.restart', desc: 'Restart server', params: [] },
                { cmd: 'server.save', desc: 'Save world', params: [] },
                { cmd: 'server.shutdown', desc: 'Shutdown server', params: ['seconds'] },
                { cmd: 'ban', desc: 'Ban player', params: ['player', 'reason'] },
                { cmd: 'kick', desc: 'Kick player', params: ['player', 'reason'] },
                { cmd: 'mute', desc: 'Mute player', params: ['player', 'minutes'] }
            ],
            player: [
                { cmd: 'teleport', desc: 'Teleport to player', params: ['player'] },
                { cmd: 'teleport.pos', desc: 'Teleport to position', params: ['x', 'y', 'z'] },
                { cmd: 'give', desc: 'Give item', params: ['player', 'item', 'quantity'] },
                { cmd: 'heal', desc: 'Heal player', params: ['player'] }
            ],
            world: [
                { cmd: 'time.set', desc: 'Set time', params: ['hour'] },
                { cmd: 'weather.set', desc: 'Set weather', params: ['type'] },
                { cmd: 'decay.scale', desc: 'Set decay scale', params: ['scale'] },
                { cmd: 'entity.clear', desc: 'Clear entities', params: ['type'] }
            ],
            entity: [
                { cmd: 'spawn', desc: 'Spawn entity', params: ['type', 'x', 'y', 'z'] },
                { cmd: 'kill', desc: 'Kill entity', params: ['id'] },
                { cmd: 'remove', desc: 'Remove entity', params: ['id'] }
            ],
            time: [
                { cmd: 'time.day', desc: 'Set day', params: [] },
                { cmd: 'time.night', desc: 'Set night', params: [] },
                { cmd: 'time.freeze', desc: 'Freeze time', params: ['freeze'] }
            ]
        };
    }

    loadFavorites() {
        const saved = localStorage.getItem('tdl_favorite_commands');
        return saved ? JSON.parse(saved) : [];
    }

    loadHistory() {
        const saved = localStorage.getItem('tdl_command_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveFavorites() {
        localStorage.setItem('tdl_favorite_commands', JSON.stringify(this.favorites));
    }

    saveHistory() {
        localStorage.setItem('tdl_command_history', JSON.stringify(this.history.slice(0, 50)));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'global') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-global');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="global-container">
                <div class="global-header">
                    <h2>🌍 GLOBAL COMMANDS</h2>
                    <div class="global-controls">
                        <button id="clear-history" class="global-btn">🗑️ CLEAR HISTORY</button>
                        <button id="refresh-global" class="global-btn">🔄 REFRESH</button>
                    </div>
                </div>

                <div class="global-grid">
                    <!-- Command Categories -->
                    <div class="categories-panel">
                        <h3>COMMAND CATEGORIES</h3>
                        <div class="category-buttons">
                            <button class="cat-btn active" data-cat="all">ALL</button>
                            <button class="cat-btn" data-cat="admin">👑 ADMIN</button>
                            <button class="cat-btn" data-cat="player">👥 PLAYER</button>
                            <button class="cat-btn" data-cat="world">🌍 WORLD</button>
                            <button class="cat-btn" data-cat="entity">🚗 ENTITY</button>
                            <button class="cat-btn" data-cat="time">⏰ TIME</button>
                            <button class="cat-btn" data-cat="favorites">⭐ FAVORITES</button>
                        </div>

                        <div class="command-list" id="command-list"></div>
                    </div>

                    <!-- Command Execution -->
                    <div class="execution-panel">
                        <h3>EXECUTE COMMAND</h3>
                        
                        <div class="command-input">
                            <input type="text" id="command-input" placeholder="Enter command...">
                            <button id="execute-command" class="global-btn primary">EXECUTE</button>
                        </div>

                        <div class="command-params" id="command-params"></div>

                        <div class="quick-commands">
                            <h4>QUICK COMMANDS</h4>
                            <div class="quick-buttons">
                                <button class="quick-cmd" data-cmd="say Hello">💬 Say Hello</button>
                                <button class="quick-cmd" data-cmd="kick">👢 Kick</button>
                                <button class="quick-cmd" data-cmd="ban">🔨 Ban</button>
                                <button class="quick-cmd" data-cmd="mute">🔇 Mute</button>
                                <button class="quick-cmd" data-cmd="time 12">⏰ Set Time 12</button>
                                <button class="quick-cmd" data-cmd="weather clear">☀️ Clear Weather</button>
                            </div>
                        </div>

                        <div class="command-output">
                            <h4>OUTPUT</h4>
                            <div id="command-output" class="output-box"></div>
                        </div>
                    </div>

                    <!-- History & Favorites -->
                    <div class="history-panel">
                        <h3>COMMAND HISTORY</h3>
                        <div id="history-list" class="history-list"></div>

                        <h4 style="margin-top: 20px;">⭐ FAVORITES</h4>
                        <div id="favorites-list" class="favorites-list"></div>
                    </div>
                </div>

                <!-- Parameter Modal -->
                <div id="param-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3 id="param-title">Enter Parameters</h3>
                        <div id="param-fields"></div>
                        <div class="modal-actions">
                            <button id="execute-with-params" class="global-btn primary">EXECUTE</button>
                            <button id="cancel-params" class="global-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderCommands();
        this.renderHistory();
        this.renderFavorites();
    }

    attachEvents() {
        document.getElementById('execute-command')?.addEventListener('click', () => this.executeCommand());
        document.getElementById('command-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.executeCommand();
        });
        document.getElementById('clear-history')?.addEventListener('click', () => this.clearHistory());
        document.getElementById('refresh-global')?.addEventListener('click', () => this.refresh());

        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.cat;
                this.renderCommands(this.currentCategory);
            });
        });

        document.querySelectorAll('.quick-cmd').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cmd = e.target.dataset.cmd;
                document.getElementById('command-input').value = cmd;
            });
        });

        document.getElementById('execute-with-params')?.addEventListener('click', () => this.executeWithParams());
        document.getElementById('cancel-params')?.addEventListener('click', () => {
            document.getElementById('param-modal').classList.add('hidden');
        });

        // Delegate for command list actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('history-cmd')) {
                const cmd = e.target.dataset.cmd;
                document.getElementById('command-input').value = cmd;
            }
            if (e.target.classList.contains('favorite-cmd')) {
                const cmd = e.target.dataset.cmd;
                document.getElementById('command-input').value = cmd;
            }
            if (e.target.classList.contains('star-favorite')) {
                const cmd = e.target.dataset.cmd;
                this.toggleFavorite(cmd);
            }
            if (e.target.classList.contains('cmd-item')) {
                const cmd = e.target.dataset.cmd;
                const params = e.target.dataset.params ? e.target.dataset.params.split(',') : [];
                if (params.length > 0) {
                    this.showParamModal(cmd, params);
                } else {
                    document.getElementById('command-input').value = cmd;
                }
            }
        });
    }

    renderCommands(category = 'all') {
        const container = document.getElementById('command-list');
        let html = '';

        if (category === 'favorites') {
            if (this.favorites.length === 0) {
                html = '<div class="no-favorites">No favorite commands</div>';
            } else {
                this.favorites.forEach(cmd => {
                    html += `
                        <div class="command-item">
                            <div class="cmd-info">
                                <span class="cmd-name">${cmd}</span>
                            </div>
                            <div class="cmd-actions">
                                <button class="cmd-btn history-cmd" data-cmd="${cmd}">📋</button>
                                <button class="cmd-btn star-favorite active" data-cmd="${cmd}">⭐</button>
                            </div>
                        </div>
                    `;
                });
            }
        } else {
            const cmdList = category === 'all' 
                ? Object.values(this.commands).flat()
                : this.commands[category] || [];

            cmdList.forEach(item => {
                const isFavorite = this.favorites.includes(item.cmd);
                const paramsStr = item.params.length > 0 ? item.params.join(',') : '';
                html += `
                    <div class="command-item cmd-item" data-cmd="${item.cmd}" data-params="${paramsStr}">
                        <div class="cmd-info">
                            <span class="cmd-name">${item.cmd}</span>
                            <span class="cmd-desc">${item.desc}</span>
                        </div>
                        <div class="cmd-actions">
                            <button class="cmd-btn history-cmd" data-cmd="${item.cmd}">📋</button>
                            <button class="cmd-btn star-favorite ${isFavorite ? 'active' : ''}" data-cmd="${item.cmd}">⭐</button>
                        </div>
                    </div>
                `;
            });
        }

        container.innerHTML = html;
    }

    renderHistory() {
        const container = document.getElementById('history-list');
        if (this.history.length === 0) {
            container.innerHTML = '<div class="no-history">No command history</div>';
            return;
        }
        container.innerHTML = this.history.map(cmd => `
            <div class="history-item">
                <span class="history-cmd" data-cmd="${cmd}">${cmd}</span>
                <button class="small-btn star-favorite" data-cmd="${cmd}">⭐</button>
            </div>
        `).join('');
    }

    renderFavorites() {
        const container = document.getElementById('favorites-list');
        if (this.favorites.length === 0) {
            container.innerHTML = '<div class="no-favorites">No favorites</div>';
            return;
        }
        container.innerHTML = this.favorites.map(cmd => `
            <div class="favorite-item">
                <span class="favorite-cmd" data-cmd="${cmd}">${cmd}</span>
                <button class="small-btn star-favorite active" data-cmd="${cmd}">⭐</button>
            </div>
        `).join('');
    }

    executeCommand() {
        const cmd = document.getElementById('command-input').value.trim();
        if (!cmd) return;
        this.history.unshift(cmd);
        this.saveHistory();
        this.renderHistory();
        this.tablet.showToast(`Executing: ${cmd}`, 'info');
        ConnectionManager.executeCommand(cmd).then(output => {
            document.getElementById('command-output').innerText = output || 'Command executed successfully';
        }).catch(err => {
            document.getElementById('command-output').innerText = `Error: ${err.message}`;
        });
        document.getElementById('command-input').value = '';
    }

    showParamModal(cmd, params) {
        const modal = document.getElementById('param-modal');
        const title = document.getElementById('param-title');
        title.innerText = `Enter parameters for ${cmd}`;
        const fieldsDiv = document.getElementById('param-fields');
        fieldsDiv.innerHTML = '';
        params.forEach(param => {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = param;
            input.className = 'param-input';
            input.dataset.param = param;
            fieldsDiv.appendChild(input);
        });
        modal.dataset.cmd = cmd;
        modal.classList.remove('hidden');
    }

    executeWithParams() {
        const modal = document.getElementById('param-modal');
        const cmd = modal.dataset.cmd;
        const inputs = document.querySelectorAll('#param-fields .param-input');
        const values = Array.from(inputs).map(inp => inp.value.trim()).filter(v => v !== '');
        if (values.length !== inputs.length) {
            this.tablet.showError('Please fill all parameters');
            return;
        }
        const fullCmd = cmd + ' ' + values.join(' ');
        document.getElementById('command-input').value = fullCmd;
        modal.classList.add('hidden');
        this.executeCommand();
    }

    toggleFavorite(cmd) {
        const index = this.favorites.indexOf(cmd);
        if (index === -1) {
            this.favorites.push(cmd);
            this.tablet.showToast('Added to favorites', 'success');
        } else {
            this.favorites.splice(index, 1);
            this.tablet.showToast('Removed from favorites', 'info');
        }
        this.saveFavorites();
        this.renderCommands(this.currentCategory);
        this.renderFavorites();
    }

    clearHistory() {
        if (!confirm('Clear command history?')) return;
        this.history = [];
        this.saveHistory();
        this.renderHistory();
        this.tablet.showToast('History cleared', 'info');
    }

    refresh() {
        this.renderCommands(this.currentCategory);
        this.renderHistory();
        this.renderFavorites();
        this.tablet.showToast('Global commands refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.globalCommands = new Global();
});