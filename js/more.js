// MORE TOOLS - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class MoreTools {
    constructor(tablet) {
        this.tablet = tablet;
        this.init();
    }

    init() {
        this.createMoreHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'more') {
                this.refresh();
            }
        });
    }

    createMoreHTML() {
        const moreTab = document.getElementById('tab-more');
        if (!moreTab) return;

        moreTab.innerHTML = `
            <div class="more-container">
                <div class="more-header">
                    <h2>📊 MORE TOOLS</h2>
                    <p>All additional dashboard features</p>
                </div>

                <div class="more-grid" id="more-grid">
                    <!-- Grid will be populated dynamically -->
                </div>
            </div>
        `;

        this.renderGrid();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('more-card')) {
                const tab = e.target.dataset.tab;
                if (tab) {
                    this.switchToTab(tab);
                }
            }
        });
    }

    renderGrid() {
        const grid = document.getElementById('more-grid');
        if (!grid) return;

        // Define all available tools (excluding the ones already on home)
        const tools = [
            { tab: 'items', icon: '📦', name: 'Items', desc: 'Item banning & database' },
            { tab: 'decay', icon: '⏳', name: 'Decay', desc: 'Decay & upkeep settings' },
            { tab: 'scheduler', icon: '📅', name: 'Scheduler', desc: 'Scheduled actions' },
            { tab: 'zones', icon: '🗺️', name: 'Zones', desc: 'Zone management' },
            { tab: 'zorp', icon: '🎮', name: 'ZORP', desc: 'ZORP zone ownership' },
            { tab: 'status', icon: '📊', name: 'Status', desc: 'Server status overview' },
            { tab: 'entities', icon: '🚗', name: 'Entities', desc: 'Entity spawn/management' },
            { tab: 'events', icon: '🎉', name: 'Events', desc: 'Event manager' },
            { tab: 'global', icon: '🌍', name: 'Global', desc: 'Global command executor' },
            { tab: 'modifiers', icon: '⚙️', name: 'Modifiers', desc: 'Item modifiers' },
            { tab: 'spawn', icon: '🎯', name: 'Spawn', desc: 'Spawn items/entities' },
            { tab: 'economy', icon: '💰', name: 'Economy', desc: 'Economy system' },
            { tab: 'clans', icon: '👥', name: 'Clans', desc: 'Clan management' },
            { tab: 'playerHub', icon: '📊', name: 'Player Hub', desc: 'Player statistics hub' },
            { tab: 'profiling', icon: '🎯', name: 'Profiling', desc: 'Player profiling' },
            { tab: 'psych', icon: '🧠', name: 'Psychological', desc: 'Psychological profiling' },
            { tab: 'predictive', icon: '📈', name: 'Predictive', desc: 'Predictive analytics' },
            { tab: 'heatmap', icon: '🔥', name: 'Heatmap', desc: 'Activity heatmap' },
            { tab: 'autoMod', icon: '🛡️', name: 'Auto-Mod', desc: 'Auto-moderation' },
            { tab: 'performance', icon: '📊', name: 'Performance', desc: 'Performance monitor' },
            { tab: 'discord', icon: '🔗', name: 'Discord', desc: 'Discord integration' },
            { tab: 'voice', icon: '🎤', name: 'Voice', desc: 'Voice commands' },
            { tab: 'polls', icon: '🗳️', name: 'Polls', desc: 'Community polls' },
            { tab: 'mobile', icon: '📱', name: 'Mobile', desc: 'Mobile sync' },
            { tab: 'raid', icon: '⚡', name: 'Raid Detector', desc: 'Raid detection' },
            { tab: 'trading', icon: '💰', name: 'Trading', desc: 'Trading floor' },
            { tab: 'defense', icon: '🛡️', name: 'Defense', desc: 'Base defense simulator' },
            { tab: 'alliance', icon: '🤝', name: 'Alliance', desc: 'Alliance network' },
            { tab: 'map3d', icon: '🏔️', name: '3D Map', desc: '3D map view' },
            { tab: 'drainedAI', icon: '🤖', name: 'Drained AI', desc: 'AI assistant' },
            { tab: 'backup', icon: '💾', name: 'Backup', desc: 'Backup/restore' },
            { tab: 'settings', icon: '⚙️', name: 'Dashboard Settings', desc: 'Dashboard preferences' }
        ];

        let html = '';
        tools.forEach(tool => {
            html += `
                <div class="more-card" data-tab="${tool.tab}">
                    <div class="card-icon">${tool.icon}</div>
                    <div class="card-name">${tool.name}</div>
                    <div class="card-desc">${tool.desc}</div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    switchToTab(tabId) {
        // Hide all tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        // Show the selected tab pane
        const targetPane = document.getElementById(`tab-${tabId}`);
        if (targetPane) {
            targetPane.classList.add('active');
            window.dispatchEvent(new CustomEvent('tab-changed', { detail: { tab: tabId } }));
        } else {
            console.warn(`Tab pane not found: tab-${tabId}`);
        }
    }

    refresh() {
        this.renderGrid();
        this.tablet.showToast('More tools refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.moreTools = new MoreTools(window.drainedTablet);
});