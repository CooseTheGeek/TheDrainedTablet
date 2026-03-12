// deepseek-ai.js – DRAINED TABLET ULTIMATE v7.0.0
// Master‑only AI assistant with tool execution, plan/approval mode, and session persistence.
// Replaces the old drainedAI.js with full functionality.

class DeepSeekAI {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.enabled = true;
        this.sessions = this.loadSessions();
        this.currentSession = null;
        this.tools = this.defineTools();
        this.permissionMode = 'ask'; // 'allow', 'ask', 'deny'
        this.planMode = false;
        this.init();
    }

    defineTools() {
        return {
            // RCON command execution (requires permission)
            executeCommand: {
                name: 'executeCommand',
                description: 'Execute an RCON command on the server',
                parameters: {
                    command: { type: 'string', description: 'The RCON command to execute' }
                },
                requiresPermission: true,
                execute: async (params) => {
                    if (!this.access.hasRole('master')) throw new Error('Master role required');
                    return await ConnectionManager.executeCommand(params.command);
                }
            },
            // File system operations (restricted)
            readFile: {
                name: 'readFile',
                description: 'Read a file from the server (bridge)',
                parameters: {
                    path: { type: 'string', description: 'File path' }
                },
                requiresPermission: true,
                execute: async (params) => {
                    // This would need a bridge endpoint
                    throw new Error('Not implemented');
                }
            },
            // Web search (simulated)
            webSearch: {
                name: 'webSearch',
                description: 'Search the web for information',
                parameters: {
                    query: { type: 'string', description: 'Search query' }
                },
                requiresPermission: true,
                execute: async (params) => {
                    // Simulated – in production, use a search API
                    return `[Simulated search results for "${params.query}"]`;
                }
            },
            // Get server status
            getStatus: {
                name: 'getStatus',
                description: 'Get current server status',
                parameters: {},
                requiresPermission: false,
                execute: async () => {
                    return {
                        players: AppState.players.length,
                        fps: this.tablet.serverStats?.fps,
                        uptime: this.tablet.serverStats?.uptime,
                        cpu: this.tablet.serverStats?.cpu
                    };
                }
            },
            // Suggest action (plan mode)
            suggestAction: {
                name: 'suggestAction',
                description: 'Suggest an action based on current state',
                parameters: {},
                requiresPermission: false,
                execute: async () => {
                    // AI would generate suggestion; for now, return placeholder
                    return 'Consider running a cargo ship event.';
                }
            }
        };
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.loadSession('default');
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'deepseek') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-deepseek');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="ai-container">
                <div class="ai-header">
                    <h2>🤖 DEEPSEEK AI ASSISTANT</h2>
                    <div class="ai-status">
                        <span id="ai-status-indicator" class="status-${this.enabled ? 'online' : 'offline'}">●</span>
                        <span>${this.enabled ? 'Online' : 'Offline'}</span>
                        <button id="ai-toggle" class="ai-btn small">${this.enabled ? 'Disable' : 'Enable'}</button>
                    </div>
                </div>

                <div class="ai-session-bar">
                    <select id="ai-session-select">
                        ${Object.keys(this.sessions).map(name => `<option value="${name}">${name}</option>`).join('')}
                    </select>
                    <button id="ai-new-session" class="ai-btn small">➕ New</button>
                    <button id="ai-save-session" class="ai-btn small">💾 Save</button>
                    <button id="ai-delete-session" class="ai-btn small">🗑️</button>
                </div>

                <div class="ai-controls">
                    <label>Permission mode:
                        <select id="ai-permission-mode">
                            <option value="allow" ${this.permissionMode === 'allow' ? 'selected' : ''}>Allow all</option>
                            <option value="ask" ${this.permissionMode === 'ask' ? 'selected' : ''}>Ask for approval</option>
                            <option value="deny" ${this.permissionMode === 'deny' ? 'selected' : ''}>Deny all</option>
                        </select>
                    </label>
                    <label>
                        <input type="checkbox" id="ai-plan-mode" ${this.planMode ? 'checked' : ''}> Plan mode (AI proposes actions only)
                    </label>
                </div>

                <div class="ai-chat">
                    <div class="ai-messages" id="ai-messages"></div>
                    <div class="ai-input-area">
                        <textarea id="ai-input" placeholder="Ask me anything..." rows="3"></textarea>
                        <button id="ai-send" class="ai-btn primary">Send</button>
                        <button id="ai-stop" class="ai-btn">⏹️ Stop</button>
                    </div>
                </div>

                <div class="ai-tools-panel">
                    <h3>🔧 Available Tools</h3>
                    <div id="ai-tools-list" class="ai-tools-list"></div>
                </div>
            </div>
        `;

        this.renderTools();
        this.renderMessages();
    }

    attachEvents() {
        document.getElementById('ai-toggle')?.addEventListener('click', () => this.toggleAI());
        document.getElementById('ai-new-session')?.addEventListener('click', () => this.newSession());
        document.getElementById('ai-save-session')?.addEventListener('click', () => this.saveSession());
        document.getElementById('ai-delete-session')?.addEventListener('click', () => this.deleteSession());
        document.getElementById('ai-session-select')?.addEventListener('change', (e) => this.loadSession(e.target.value));
        document.getElementById('ai-permission-mode')?.addEventListener('change', (e) => {
            this.permissionMode = e.target.value;
        });
        document.getElementById('ai-plan-mode')?.addEventListener('change', (e) => {
            this.planMode = e.target.checked;
        });
        document.getElementById('ai-send')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('ai-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        document.getElementById('ai-stop')?.addEventListener('click', () => this.stopGeneration());
    }

    toggleAI() {
        this.enabled = !this.enabled;
        const indicator = document.getElementById('ai-status-indicator');
        const btn = document.getElementById('ai-toggle');
        if (this.enabled) {
            indicator.className = 'status-online';
            btn.innerText = 'Disable';
        } else {
            indicator.className = 'status-offline';
            btn.innerText = 'Enable';
        }
    }

    loadSessions() {
        const saved = localStorage.getItem('tdl_ai_sessions');
        return saved ? JSON.parse(saved) : {
            default: {
                name: 'default',
                messages: [{ role: 'assistant', content: 'Hello, I am DeepSeek AI. How can I help you manage your server?' }],
                created: Date.now()
            }
        };
    }

    saveSessions() {
        localStorage.setItem('tdl_ai_sessions', JSON.stringify(this.sessions));
    }

    loadSession(name) {
        if (this.sessions[name]) {
            this.currentSession = this.sessions[name];
            this.renderMessages();
        }
    }

    newSession() {
        const name = prompt('Enter session name:');
        if (!name) return;
        if (this.sessions[name]) {
            alert('Session already exists');
            return;
        }
        this.sessions[name] = {
            name,
            messages: [{ role: 'assistant', content: 'New session started. How can I help?' }],
            created: Date.now()
        };
        this.saveSessions();
        this.updateSessionSelect();
        this.loadSession(name);
    }

    saveSession() {
        if (this.currentSession) {
            this.sessions[this.currentSession.name] = this.currentSession;
            this.saveSessions();
            toast.success('Session saved');
        }
    }

    deleteSession() {
        const name = this.currentSession?.name;
        if (!name || name === 'default') {
            alert('Cannot delete default session');
            return;
        }
        if (confirm(`Delete session "${name}"?`)) {
            delete this.sessions[name];
            this.saveSessions();
            this.updateSessionSelect();
            this.loadSession('default');
        }
    }

    updateSessionSelect() {
        const select = document.getElementById('ai-session-select');
        select.innerHTML = Object.keys(this.sessions).map(name => 
            `<option value="${name}" ${this.currentSession?.name === name ? 'selected' : ''}>${name}</option>`
        ).join('');
    }

    renderMessages() {
        const container = document.getElementById('ai-messages');
        if (!container || !this.currentSession) return;
        container.innerHTML = this.currentSession.messages.map(msg => `
            <div class="ai-message ${msg.role}">
                <div class="message-avatar">${msg.role === 'user' ? '👤' : '🤖'}</div>
                <div class="message-content">${this.escapeHtml(msg.content)}</div>
            </div>
        `).join('');
        container.scrollTop = container.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async sendMessage() {
        const input = document.getElementById('ai-input');
        const text = input.value.trim();
        if (!text || !this.enabled) return;

        // Add user message
        this.currentSession.messages.push({ role: 'user', content: text });
        this.renderMessages();
        input.value = '';

        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message assistant typing';
        typingDiv.innerHTML = '<div class="message-avatar">🤖</div><div class="message-content"><span class="typing-dots">...</span></div>';
        document.getElementById('ai-messages').appendChild(typingDiv);

        try {
            // Simulate AI processing (in production, call an actual API)
            const response = await this.processRequest(text);
            typingDiv.remove();
            this.currentSession.messages.push({ role: 'assistant', content: response });
            this.renderMessages();
            this.saveSession();
        } catch (err) {
            typingDiv.remove();
            this.currentSession.messages.push({ role: 'assistant', content: `Error: ${err.message}` });
            this.renderMessages();
        }
    }

    async processRequest(userInput) {
        // Simple command parsing for demo
        const lower = userInput.toLowerCase();
        if (lower.includes('status') || lower.includes('how many players')) {
            const status = await this.tools.getStatus.execute();
            return `Current server status: ${status.players} players online, FPS: ${status.fps}, CPU: ${status.cpu}%, Uptime: ${status.uptime}`;
        }
        if (lower.includes('suggest') || lower.includes('what should i do')) {
            return await this.tools.suggestAction.execute();
        }
        if (lower.startsWith('!')) {
            // RCON command – requires permission
            const cmd = userInput.substring(1);
            if (this.permissionMode === 'deny') {
                return 'Command execution is disabled.';
            }
            if (this.permissionMode === 'ask') {
                if (!confirm(`Execute RCON command: ${cmd}?`)) {
                    return 'Command cancelled.';
                }
            }
            try {
                const result = await this.tools.executeCommand.execute({ command: cmd });
                return `Command executed:\n${result}`;
            } catch (err) {
                return `Error: ${err.message}`;
            }
        }
        // Default fallback
        return `I understand you're asking about "${userInput}". As an AI, I can help with server management commands. Try asking for status or suggestions.`;
    }

    stopGeneration() {
        // In a real implementation, abort fetch
        toast.info('Generation stopped');
    }

    renderTools() {
        const container = document.getElementById('ai-tools-list');
        if (!container) return;
        container.innerHTML = Object.values(this.tools).map(tool => `
            <div class="tool-item">
                <span class="tool-name">${tool.name}</span>
                <span class="tool-desc">${tool.description}</span>
                ${tool.requiresPermission ? '<span class="tool-lock">🔒</span>' : ''}
            </div>
        `).join('');
    }

    refresh() {
        this.renderMessages();
        this.renderTools();
        this.updateSessionSelect();
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.deepseekAI = new DeepSeekAI();
});