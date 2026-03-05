// COMMUNITY POLLS - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Stewart (CooseTheGeek). All Rights Reserved.

class CommunityPolls {
    constructor(tablet) {
        this.tablet = tablet;
        this.polls = this.loadPolls();
        this.activePoll = null;
        this.init();
    }

    loadPolls() {
        const saved = localStorage.getItem('drained_polls');
        return saved ? JSON.parse(saved) : [
            {
                id: 'poll_1',
                question: 'When should we wipe?',
                options: [
                    { text: 'Every 2 weeks', votes: 45 },
                    { text: 'Monthly', votes: 23 },
                    { text: 'Bi-weekly', votes: 12 },
                    { text: 'Weekly', votes: 6 }
                ],
                createdBy: 'CooseTheGeek',
                createdAt: new Date().toISOString(),
                endsAt: new Date(Date.now() + 7*86400000).toISOString(),
                active: true,
                anonymous: true,
                multipleChoice: false
            }
        ];
    }

    savePolls() {
        localStorage.setItem('drained_polls', JSON.stringify(this.polls));
    }

    init() {
        this.createPollsHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'polls') {
                this.refresh();
            }
        });
    }

    createPollsHTML() {
        const pollsTab = document.getElementById('tab-polls');
        if (!pollsTab) return;

        pollsTab.innerHTML = `
            <div class="polls-container">
                <div class="polls-header">
                    <h2>🗳️ COMMUNITY POLLS</h2>
                    <button id="create-poll" class="polls-btn primary">➕ CREATE POLL</button>
                </div>

                <div class="polls-grid" id="polls-grid"></div>

                <!-- Create Poll Modal -->
                <div id="poll-modal" class="modal hidden">
                    <div class="modal-content poll-modal">
                        <h2>CREATE NEW POLL</h2>
                        
                        <div class="form-group">
                            <label>Question:</label>
                            <input type="text" id="poll-question" placeholder="e.g., When should we wipe?">
                        </div>
                        
                        <div class="form-group">
                            <label>Options (one per line):</label>
                            <textarea id="poll-options" rows="4" placeholder="Every 2 weeks&#10;Monthly&#10;Weekly"></textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Duration (days):</label>
                                <input type="number" id="poll-duration" value="7" min="1" max="30">
                            </div>
                            
                            <div class="checkbox-group">
                                <label>
                                    <input type="checkbox" id="poll-anonymous" checked>
                                    Anonymous
                                </label>
                                <label>
                                    <input type="checkbox" id="poll-multiple">
                                    Allow multiple choices
                                </label>
                            </div>
                        </div>
                        
                        <div class="modal-actions">
                            <button id="save-poll" class="polls-btn primary">CREATE POLL</button>
                            <button id="cancel-poll" class="polls-btn">CANCEL</button>
                        </div>
                    </div>
                </div>

                <!-- Vote Modal -->
                <div id="vote-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3 id="vote-question">Vote</h3>
                        <div id="vote-options" class="vote-options"></div>
                        <div class="modal-actions">
                            <button id="submit-vote" class="polls-btn primary">SUBMIT VOTE</button>
                            <button id="cancel-vote" class="polls-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderPolls();
    }

    setupEventListeners() {
        document.getElementById('create-poll')?.addEventListener('click', () => this.openPollModal());
        document.getElementById('save-poll')?.addEventListener('click', () => this.savePoll());
        document.getElementById('cancel-poll')?.addEventListener('click', () => {
            document.getElementById('poll-modal').classList.add('hidden');
        });

        document.getElementById('submit-vote')?.addEventListener('click', () => this.submitVote());
        document.getElementById('cancel-vote')?.addEventListener('click', () => {
            document.getElementById('vote-modal').classList.add('hidden');
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-poll')) {
                const id = e.target.dataset.id;
                this.viewPoll(id);
            }
            if (e.target.classList.contains('vote-poll')) {
                const id = e.target.dataset.id;
                this.openVoteModal(id);
            }
            if (e.target.classList.contains('end-poll')) {
                const id = e.target.dataset.id;
                this.endPoll(id);
            }
            if (e.target.classList.contains('delete-poll')) {
                const id = e.target.dataset.id;
                this.deletePoll(id);
            }
        });
    }

    renderPolls() {
        const grid = document.getElementById('polls-grid');
        if (!grid) return;

        if (this.polls.length === 0) {
            grid.innerHTML = '<div class="no-polls">No active polls</div>';
            return;
        }

        let html = '';
        this.polls.forEach(poll => {
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
            const endsIn = Math.ceil((new Date(poll.endsAt) - new Date()) / (1000 * 60 * 60 * 24));
            
            html += `
                <div class="poll-card ${poll.active ? 'active' : 'ended'}">
                    <div class="poll-header">
                        <h3>${poll.question}</h3>
                        <span class="poll-status">${poll.active ? '🟢 ACTIVE' : '⚫ ENDED'}</span>
                    </div>
                    
                    <div class="poll-body">
                        ${poll.options.map(opt => `
                            <div class="poll-option">
                                <div class="option-text">${opt.text}</div>
                                <div class="option-bar">
                                    <div class="bar-fill" style="width: ${totalVotes ? (opt.votes / totalVotes * 100) : 0}%"></div>
                                </div>
                                <div class="option-votes">${opt.votes} votes (${totalVotes ? Math.round(opt.votes / totalVotes * 100) : 0}%)</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="poll-footer">
                        <div class="poll-meta">
                            <span>📊 ${totalVotes} total votes</span>
                            <span>⏱️ Ends in ${endsIn} days</span>
                            <span>👤 By ${poll.createdBy}</span>
                        </div>
                        <div class="poll-actions">
                            ${poll.active ? `<button class="small-btn vote-poll" data-id="${poll.id}">🗳️ VOTE</button>` : ''}
                            <button class="small-btn view-poll" data-id="${poll.id}">👁️ VIEW</button>
                            ${this.tablet.isMaster() ? `
                                <button class="small-btn end-poll" data-id="${poll.id}">⏹️ END</button>
                                <button class="small-btn delete-poll" data-id="${poll.id}">🗑️</button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    openPollModal() {
        document.getElementById('poll-modal').classList.remove('hidden');
    }

    savePoll() {
        const question = document.getElementById('poll-question').value;
        const optionsText = document.getElementById('poll-options').value;
        const duration = parseInt(document.getElementById('poll-duration').value);
        const anonymous = document.getElementById('poll-anonymous').checked;
        const multipleChoice = document.getElementById('poll-multiple').checked;

        if (!question || !optionsText) {
            this.tablet.showError('Please fill all fields');
            return;
        }

        const options = optionsText.split('\n')
            .filter(opt => opt.trim())
            .map(opt => ({ text: opt.trim(), votes: 0 }));

        if (options.length < 2) {
            this.tablet.showError('At least 2 options required');
            return;
        }

        const poll = {
            id: 'poll_' + Date.now(),
            question: question,
            options: options,
            createdBy: this.tablet.currentUser || 'Admin',
            createdAt: new Date().toISOString(),
            endsAt: new Date(Date.now() + duration * 86400000).toISOString(),
            active: true,
            anonymous: anonymous,
            multipleChoice: multipleChoice
        };

        this.polls.unshift(poll);
        this.savePolls();
        this.renderPolls();
        document.getElementById('poll-modal').classList.add('hidden');
        this.tablet.showToast('Poll created!', 'success');
    }

    openVoteModal(pollId) {
        const poll = this.polls.find(p => p.id === pollId);
        if (!poll) return;

        this.currentVotePoll = poll;
        document.getElementById('vote-question').innerText = poll.question;

        const options = document.getElementById('vote-options');
        options.innerHTML = poll.options.map((opt, index) => `
            <div class="vote-option">
                <label>
                    <input type="${poll.multipleChoice ? 'checkbox' : 'radio'}" name="vote" value="${index}">
                    ${opt.text}
                </label>
            </div>
        `).join('');

        document.getElementById('vote-modal').classList.remove('hidden');
    }

    submitVote() {
        if (!this.currentVotePoll) return;

        const selected = Array.from(document.querySelectorAll('input[name="vote"]:checked'))
            .map(input => parseInt(input.value));

        if (selected.length === 0) {
            this.tablet.showError('Select an option');
            return;
        }

        const poll = this.currentVotePoll;
        selected.forEach(index => {
            poll.options[index].votes++;
        });

        this.savePolls();
        this.renderPolls();
        document.getElementById('vote-modal').classList.add('hidden');
        this.tablet.showToast('Vote recorded!', 'success');
    }

    viewPoll(id) {
        const poll = this.polls.find(p => p.id === id);
        if (!poll) return;

        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
        let results = `${poll.question}\n\n`;
        poll.options.forEach(opt => {
            const percentage = totalVotes ? Math.round(opt.votes / totalVotes * 100) : 0;
            results += `${opt.text}: ${opt.votes} votes (${percentage}%)\n`;
        });

        alert(results);
    }

    endPoll(id) {
        const poll = this.polls.find(p => p.id === id);
        if (poll) {
            poll.active = false;
            this.savePolls();
            this.renderPolls();
            this.tablet.showToast('Poll ended', 'info');
        }
    }

    deletePoll(id) {
        this.tablet.showConfirm('Delete this poll?', (confirmed) => {
            if (confirmed) {
                this.polls = this.polls.filter(p => p.id !== id);
                this.savePolls();
                this.renderPolls();
                this.tablet.showToast('Poll deleted', 'info');
            }
        });
    }

    refresh() {
        this.renderPolls();
        this.tablet.showToast('Polls refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.communityPolls = new CommunityPolls(window.drainedTablet);
});