// CLANS SYSTEM - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class Clans {
    constructor(tablet) {
        this.tablet = tablet;
        this.clans = this.loadClans();
        this.init();
    }

    loadClans() {
        const saved = localStorage.getItem('drained_clans');
        return saved ? JSON.parse(saved) : [
            {
                id: 'clan_1',
                name: 'Rust Killers',
                tag: 'RK',
                leader: 'RustGod',
                members: ['RustGod', 'PvPKing', 'RaiderSue'],
                maxMembers: 10,
                base: { x: 1245, z: 678 },
                created: new Date().toISOString()
            },
            {
                id: 'clan_2',
                name: 'Builder Bros',
                tag: 'BB',
                leader: 'BuilderBob',
                members: ['BuilderBob', 'FarmerJoe'],
                maxMembers: 5,
                base: { x: 2341, z: 891 },
                created: new Date().toISOString()
            }
        ];
    }

    saveClans() {
        localStorage.setItem('drained_clans', JSON.stringify(this.clans));
    }

    init() {
        this.createClansHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'clans') {
                this.refresh();
            }
        });
    }

    createClansHTML() {
        const clansTab = document.getElementById('tab-clans');
        if (!clansTab) return;

        clansTab.innerHTML = `
            <div class="clans-container">
                <div class="clans-header">
                    <h2>👥 CLANS</h2>
                    <button id="create-clan" class="clans-btn primary">➕ CREATE CLAN</button>
                </div>

                <div class="clans-grid" id="clans-grid"></div>

                <div class="clan-actions">
                    <button id="refresh-clans" class="clans-btn">🔄 REFRESH</button>
                    <button id="reset-clans" class="clans-btn">🔄 RESET</button>
                </div>

                <!-- Clan Modal -->
                <div id="clan-modal" class="modal hidden">
                    <div class="modal-content clan-modal">
                        <h2 id="clan-modal-title">CREATE CLAN</h2>
                        
                        <div class="form-group">
                            <label>Clan Name:</label>
                            <input type="text" id="clan-name" placeholder="e.g., Rust Killers">
                        </div>
                        
                        <div class="form-group">
                            <label>Clan Tag:</label>
                            <input type="text" id="clan-tag" placeholder="e.g., RK" maxlength="4">
                        </div>
                        
                        <div class="form-group">
                            <label>Leader:</label>
                            <input type="text" id="clan-leader" placeholder="Player name">
                        </div>
                        
                        <div class="form-group">
                            <label>Max Members:</label>
                            <input type="number" id="clan-max" value="10" min="2" max="50">
                        </div>
                        
                        <div class="modal-actions">
                            <button id="save-clan" class="clans-btn primary">SAVE</button>
                            <button id="cancel-clan" class="clans-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderClans();
    }

    setupEventListeners() {
        document.getElementById('create-clan')?.addEventListener('click', () => this.openClanModal());
        document.getElementById('refresh-clans')?.addEventListener('click', () => this.refresh());
        document.getElementById('reset-clans')?.addEventListener('click', () => this.resetClans());
        document.getElementById('save-clan')?.addEventListener('click', () => this.saveClan());
        document.getElementById('cancel-clan')?.addEventListener('click', () => {
            document.getElementById('clan-modal').classList.add('hidden');
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-clan')) {
                const id = e.target.dataset.id;
                this.viewClan(id);
            }
            if (e.target.classList.contains('edit-clan')) {
                const id = e.target.dataset.id;
                this.editClan(id);
            }
            if (e.target.classList.contains('delete-clan')) {
                const id = e.target.dataset.id;
                this.deleteClan(id);
            }
            if (e.target.classList.contains('invite-member')) {
                const id = e.target.dataset.id;
                this.inviteMember(id);
            }
            if (e.target.classList.contains('kick-member')) {
                const id = e.target.dataset.id;
                const member = e.target.dataset.member;
                this.kickMember(id, member);
            }
        });
    }

    renderClans() {
        const grid = document.getElementById('clans-grid');
        if (!grid) return;

        if (this.clans.length === 0) {
            grid.innerHTML = '<div class="no-clans">No clans created</div>';
            return;
        }

        let html = '';
        this.clans.forEach(clan => {
            html += `
                <div class="clan-card">
                    <div class="clan-header">
                        <span class="clan-name">[${clan.tag}] ${clan.name}</span>
                        <span class="clan-size">${clan.members.length}/${clan.maxMembers}</span>
                    </div>
                    <div class="clan-body">
                        <div class="clan-leader">Leader: ${clan.leader}</div>
                        <div class="clan-members">
                            Members: ${clan.members.join(', ')}
                        </div>
                        <div class="clan-base">Base: (${clan.base.x}, 0, ${clan.base.z})</div>
                    </div>
                    <div class="clan-actions">
                        <button class="small-btn view-clan" data-id="${clan.id}">👁️ VIEW</button>
                        <button class="small-btn edit-clan" data-id="${clan.id}">✏️ EDIT</button>
                        <button class="small-btn invite-member" data-id="${clan.id}">📨 INVITE</button>
                        <button class="small-btn delete-clan" data-id="${clan.id}">🗑️</button>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    openClanModal(clanId = null) {
        const modal = document.getElementById('clan-modal');
        const title = document.getElementById('clan-modal-title');
        
        if (clanId) {
            title.innerText = 'EDIT CLAN';
            const clan = this.clans.find(c => c.id === clanId);
            if (clan) this.populateModal(clan);
        } else {
            title.innerText = 'CREATE CLAN';
            this.clearModal();
        }

        modal.classList.remove('hidden');
    }

    populateModal(clan) {
        document.getElementById('clan-name').value = clan.name;
        document.getElementById('clan-tag').value = clan.tag;
        document.getElementById('clan-leader').value = clan.leader;
        document.getElementById('clan-max').value = clan.maxMembers;
        this.editingClanId = clan.id;
    }

    clearModal() {
        document.getElementById('clan-name').value = '';
        document.getElementById('clan-tag').value = '';
        document.getElementById('clan-leader').value = '';
        document.getElementById('clan-max').value = '10';
        this.editingClanId = null;
    }

    saveClan() {
        const name = document.getElementById('clan-name').value;
        const tag = document.getElementById('clan-tag').value;
        const leader = document.getElementById('clan-leader').value;
        const maxMembers = parseInt(document.getElementById('clan-max').value);

        if (!name || !tag || !leader) {
            this.tablet.showError('Please fill all fields');
            return;
        }

        const clan = {
            id: this.editingClanId || 'clan_' + Date.now(),
            name: name,
            tag: tag,
            leader: leader,
            members: this.editingClanId ? null : [leader],
            maxMembers: maxMembers,
            base: { x: 0, z: 0 },
            created: new Date().toISOString()
        };

        if (this.editingClanId) {
            const index = this.clans.findIndex(c => c.id === this.editingClanId);
            if (index !== -1) {
                this.clans[index] = { ...this.clans[index], ...clan };
            }
        } else {
            this.clans.push(clan);
        }

        this.saveClans();
        this.renderClans();
        document.getElementById('clan-modal').classList.add('hidden');
        this.tablet.showToast(`Clan ${name} saved`, 'success');
    }

    viewClan(id) {
        const clan = this.clans.find(c => c.id === id);
        if (!clan) return;

        alert(`Clan: ${clan.name}\nTag: ${clan.tag}\nLeader: ${clan.leader}\nMembers: ${clan.members.length}/${clan.maxMembers}\nBase: (${clan.base.x}, 0, ${clan.base.z})`);
    }

    editClan(id) {
        this.openClanModal(id);
    }

    deleteClan(id) {
        this.tablet.showConfirm('Delete this clan?', (confirmed) => {
            if (confirmed) {
                this.clans = this.clans.filter(c => c.id !== id);
                this.saveClans();
                this.renderClans();
                this.tablet.showToast('Clan deleted', 'info');
            }
        });
    }

    inviteMember(id) {
        const clan = this.clans.find(c => c.id === id);
        if (!clan) return;

        const player = prompt('Enter player name to invite:');
        if (player) {
            if (clan.members.length >= clan.maxMembers) {
                this.tablet.showError('Clan is full');
                return;
            }
            clan.members.push(player);
            this.saveClans();
            this.renderClans();
            this.tablet.showToast(`Invited ${player} to ${clan.name}`, 'success');
        }
    }

    kickMember(id, member) {
        const clan = this.clans.find(c => c.id === id);
        if (!clan) return;

        if (member === clan.leader) {
            this.tablet.showError('Cannot kick the leader');
            return;
        }

        this.tablet.showConfirm(`Kick ${member} from ${clan.name}?`, (confirmed) => {
            if (confirmed) {
                clan.members = clan.members.filter(m => m !== member);
                this.saveClans();
                this.renderClans();
                this.tablet.showToast(`Kicked ${member} from clan`, 'info');
            }
        });
    }

    resetClans() {
        this.tablet.showConfirm('Reset all clans?', (confirmed) => {
            if (confirmed) {
                this.clans = [
                    {
                        id: 'clan_1',
                        name: 'Rust Killers',
                        tag: 'RK',
                        leader: 'RustGod',
                        members: ['RustGod', 'PvPKing', 'RaiderSue'],
                        maxMembers: 10,
                        base: { x: 1245, z: 678 },
                        created: new Date().toISOString()
                    },
                    {
                        id: 'clan_2',
                        name: 'Builder Bros',
                        tag: 'BB',
                        leader: 'BuilderBob',
                        members: ['BuilderBob', 'FarmerJoe'],
                        maxMembers: 5,
                        base: { x: 2341, z: 891 },
                        created: new Date().toISOString()
                    }
                ];
                this.renderClans();
                this.tablet.showToast('Clans reset', 'info');
            }
        });
    }

    refresh() {
        this.renderClans();
        this.tablet.showToast('Clans refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.clans = new Clans(window.drainedTablet);
});