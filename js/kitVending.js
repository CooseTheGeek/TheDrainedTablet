// KIT VENDING MACHINES - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class KitVending {
    constructor(tablet) {
        this.tablet = tablet;
        this.machines = this.loadMachines();
        this.kits = this.loadKits();
        this.init();
    }

    loadMachines() {
        const saved = localStorage.getItem('drained_vending_machines');
        return saved ? JSON.parse(saved) : [
            {
                id: 'vm_1',
                name: 'Outpost KVM',
                location: { x: 1245, y: 45, z: 678 },
                kits: [
                    { kitId: 'kit_starter', price: 500, stock: 10, maxPerPlayer: 3 },
                    { kitId: 'kit_vip', price: 2000, stock: 5, maxPerPlayer: 1 }
                ],
                totalSales: 127,
                lastRestock: new Date().toISOString()
            }
        ];
    }

    loadKits() {
        const saved = localStorage.getItem('drained_kits');
        return saved ? JSON.parse(saved) : [];
    }

    saveMachines() {
        localStorage.setItem('drained_vending_machines', JSON.stringify(this.machines));
    }

    init() {
        this.createVendingHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'kitVending') {
                this.refresh();
            }
        });
    }

    createVendingHTML() {
        const vendingTab = document.getElementById('tab-kitVending');
        if (!vendingTab) return;

        vendingTab.innerHTML = `
            <div class="vending-container">
                <div class="vending-header">
                    <h2>🏪 KIT VENDING MACHINES</h2>
                    <button id="create-vm" class="vending-btn primary">+ SPAWN NEW VM</button>
                </div>

                <div class="vending-grid" id="vending-grid"></div>

                <!-- VM Modal -->
                <div id="vm-modal" class="modal hidden">
                    <div class="modal-content vm-modal">
                        <h2 id="vm-modal-title">SPAWN VENDING MACHINE</h2>
                        
                        <div class="form-group">
                            <label>VM Name:</label>
                            <input type="text" id="vm-name" placeholder="e.g., Outpost KVM">
                        </div>
                        
                        <div class="form-group">
                            <label>Location:</label>
                            <div class="coord-inputs">
                                <input type="number" id="vm-x" placeholder="X" value="0">
                                <input type="number" id="vm-y" placeholder="Y" value="0">
                                <input type="number" id="vm-z" placeholder="Z" value="0">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Location Presets:</label>
                            <div class="preset-buttons">
                                <button class="loc-preset" data-x="1245" data-y="45" data-z="678">Outpost</button>
                                <button class="loc-preset" data-x="2456" data-y="78" data-z="3456">Bandit</button>
                                <button class="loc-preset" data-x="3456" data-y="89" data-z="2345">Dome</button>
                            </div>
                        </div>
                        
                        <div class="kit-assignment">
                            <h3>ASSIGN KITS</h3>
                            <div id="kit-assignments"></div>
                            <button id="add-kit-assignment" class="small-btn">+ ADD KIT</button>
                        </div>
                        
                        <div class="modal-actions">
                            <button id="save-vm" class="vending-btn primary">SAVE VM</button>
                            <button id="cancel-vm" class="vending-btn">CANCEL</button>
                        </div>
                    </div>
                </div>

                <!-- Edit Kit Assignment Modal -->
                <div id="kit-assign-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3>EDIT KIT ASSIGNMENT</h3>
                        
                        <div class="form-group">
                            <label>Kit:</label>
                            <select id="assign-kit-select"></select>
                        </div>
                        
                        <div class="form-group">
                            <label>Price (scrap):</label>
                            <input type="number" id="assign-price" value="500" min="0">
                        </div>
                        
                        <div class="form-group">
                            <label>Stock:</label>
                            <input type="number" id="assign-stock" value="10" min="0">
                        </div>
                        
                        <div class="form-group">
                            <label>Max per player:</label>
                            <input type="number" id="assign-max" value="0" min="0">
                            <small>0 = unlimited</small>
                        </div>
                        
                        <div class="modal-actions">
                            <button id="save-assign" class="vending-btn primary">SAVE</button>
                            <button id="cancel-assign" class="vending-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderMachines();
    }

    setupEventListeners() {
        document.getElementById('create-vm')?.addEventListener('click', () => this.openVMModal());
        document.getElementById('save-vm')?.addEventListener('click', () => this.saveVM());
        document.getElementById('cancel-vm')?.addEventListener('click', () => {
            document.getElementById('vm-modal').classList.add('hidden');
        });

        document.querySelectorAll('.loc-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.getElementById('vm-x').value = e.target.dataset.x;
                document.getElementById('vm-y').value = e.target.dataset.y;
                document.getElementById('vm-z').value = e.target.dataset.z;
            });
        });

        document.getElementById('add-kit-assignment')?.addEventListener('click', () => this.addKitAssignment());

        document.getElementById('save-assign')?.addEventListener('click', () => this.saveKitAssignment());
        document.getElementById('cancel-assign')?.addEventListener('click', () => {
            document.getElementById('kit-assign-modal').classList.add('hidden');
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-vm')) {
                const id = e.target.dataset.id;
                this.editVM(id);
            }
            if (e.target.classList.contains('delete-vm')) {
                const id = e.target.dataset.id;
                this.deleteVM(id);
            }
            if (e.target.classList.contains('restock-vm')) {
                const id = e.target.dataset.id;
                this.restockVM(id);
            }
            if (e.target.classList.contains('edit-assignment')) {
                const vmId = e.target.dataset.vm;
                const kitId = e.target.dataset.kit;
                this.editAssignment(vmId, kitId);
            }
            if (e.target.classList.contains('remove-assignment')) {
                const vmId = e.target.dataset.vm;
                const kitId = e.target.dataset.kit;
                this.removeAssignment(vmId, kitId);
            }
        });
    }

    renderMachines() {
        const grid = document.getElementById('vending-grid');
        if (!grid) return;

        if (this.machines.length === 0) {
            grid.innerHTML = '<div class="no-machines">No vending machines spawned</div>';
            return;
        }

        let html = '';
        this.machines.forEach(machine => {
            const kitCount = machine.kits.length;
            const totalStock = machine.kits.reduce((sum, k) => sum + k.stock, 0);
            
            html += `
                <div class="vm-card">
                    <div class="vm-header">
                        <span class="vm-name">${machine.name}</span>
                        <span class="vm-location">(${machine.location.x}, ${machine.location.y}, ${machine.location.z})</span>
                    </div>
                    <div class="vm-stats">
                        <div>Kits: ${kitCount}</div>
                        <div>Stock: ${totalStock}</div>
                        <div>Sales: ${machine.totalSales || 0}</div>
                    </div>
                    <div class="vm-kits">
                        ${machine.kits.map(kit => {
                            const kitInfo = this.kits.find(k => k.id === kit.kitId);
                            return `
                                <div class="vm-kit">
                                    <span>${kitInfo ? kitInfo.name : 'Unknown'}</span>
                                    <span>${kit.price} scrap</span>
                                    <span>Stock: ${kit.stock}</span>
                                    <div class="kit-actions">
                                        <button class="small-btn edit-assignment" data-vm="${machine.id}" data-kit="${kit.kitId}">✏️</button>
                                        <button class="small-btn remove-assignment" data-vm="${machine.id}" data-kit="${kit.kitId}">🗑️</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="vm-actions">
                        <button class="vending-btn small edit-vm" data-id="${machine.id}">✏️ EDIT</button>
                        <button class="vending-btn small restock-vm" data-id="${machine.id}">📦 RESTOCK</button>
                        <button class="vending-btn small delete-vm" data-id="${machine.id}">🗑️ DELETE</button>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    openVMModal(machineId = null) {
        const modal = document.getElementById('vm-modal');
        const title = document.getElementById('vm-modal-title');
        
        if (machineId) {
            title.innerText = 'EDIT VENDING MACHINE';
            const machine = this.machines.find(m => m.id === machineId);
            if (machine) this.populateVMModal(machine);
        } else {
            title.innerText = 'SPAWN VENDING MACHINE';
            this.clearVMModal();
        }

        modal.classList.remove('hidden');
    }

    populateVMModal(machine) {
        document.getElementById('vm-name').value = machine.name;
        document.getElementById('vm-x').value = machine.location.x;
        document.getElementById('vm-y').value = machine.location.y;
        document.getElementById('vm-z').value = machine.location.z;

        this.currentKitAssignments = machine.kits;
        this.renderKitAssignments();
    }

    clearVMModal() {
        document.getElementById('vm-name').value = '';
        document.getElementById('vm-x').value = '0';
        document.getElementById('vm-y').value = '0';
        document.getElementById('vm-z').value = '0';
        this.currentKitAssignments = [];
        this.renderKitAssignments();
    }

    renderKitAssignments() {
        const container = document.getElementById('kit-assignments');
        
        if (this.currentKitAssignments.length === 0) {
            container.innerHTML = '<div class="no-assignments">No kits assigned</div>';
            return;
        }

        let html = '';
        this.currentKitAssignments.forEach((assign, index) => {
            const kitInfo = this.kits.find(k => k.id === assign.kitId);
            html += `
                <div class="assignment-item">
                    <span>${kitInfo ? kitInfo.name : 'Unknown'}</span>
                    <span>${assign.price} scrap</span>
                    <span>Stock: ${assign.stock}</span>
                    <span>Max: ${assign.maxPerPlayer || '∞'}</span>
                    <div>
                        <button class="small-btn edit-assignment-temp" data-index="${index}">✏️</button>
                        <button class="small-btn remove-assignment-temp" data-index="${index}">🗑️</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add temp handlers
        container.querySelectorAll('.edit-assignment-temp').forEach(btn => {
            btn.addEventListener('click', () => this.editTempAssignment(parseInt(btn.dataset.index)));
        });

        container.querySelectorAll('.remove-assignment-temp').forEach(btn => {
            btn.addEventListener('click', () => this.removeTempAssignment(parseInt(btn.dataset.index)));
        });
    }

    addKitAssignment() {
        document.getElementById('kit-assign-modal').classList.remove('hidden');
        this.editingIndex = null;
        this.populateKitSelect();
    }

    editTempAssignment(index) {
        this.editingIndex = index;
        const assign = this.currentKitAssignments[index];
        this.populateKitSelect(assign);
        document.getElementById('kit-assign-modal').classList.remove('hidden');
    }

    removeTempAssignment(index) {
        this.currentKitAssignments.splice(index, 1);
        this.renderKitAssignments();
    }

    populateKitSelect(assign = null) {
        const select = document.getElementById('assign-kit-select');
        select.innerHTML = this.kits.map(kit => 
            `<option value="${kit.id}" ${assign && kit.id === assign.kitId ? 'selected' : ''}>${kit.name}</option>`
        ).join('');

        if (assign) {
            document.getElementById('assign-price').value = assign.price;
            document.getElementById('assign-stock').value = assign.stock;
            document.getElementById('assign-max').value = assign.maxPerPlayer || 0;
        } else {
            document.getElementById('assign-price').value = 500;
            document.getElementById('assign-stock').value = 10;
            document.getElementById('assign-max').value = 0;
        }
    }

    saveKitAssignment() {
        const kitId = document.getElementById('assign-kit-select').value;
        const price = parseInt(document.getElementById('assign-price').value);
        const stock = parseInt(document.getElementById('assign-stock').value);
        const maxPerPlayer = parseInt(document.getElementById('assign-max').value);

        const assignment = { kitId, price, stock, maxPerPlayer };

        if (this.editingIndex !== null) {
            this.currentKitAssignments[this.editingIndex] = assignment;
        } else {
            this.currentKitAssignments.push(assignment);
        }

        this.renderKitAssignments();
        document.getElementById('kit-assign-modal').classList.add('hidden');
    }

    saveVM() {
        const name = document.getElementById('vm-name').value;
        const x = parseInt(document.getElementById('vm-x').value);
        const y = parseInt(document.getElementById('vm-y').value);
        const z = parseInt(document.getElementById('vm-z').value);

        if (!name) {
            this.tablet.showError('VM name required');
            return;
        }

        const machine = {
            id: 'vm_' + Date.now(),
            name: name,
            location: { x, y, z },
            kits: this.currentKitAssignments,
            totalSales: 0,
            lastRestock: new Date().toISOString()
        };

        this.machines.push(machine);
        this.saveMachines();
        this.renderMachines();

        document.getElementById('vm-modal').classList.add('hidden');
        this.tablet.showToast(`Vending machine spawned at (${x}, ${y}, ${z})`, 'success');
    }

    editVM(id) {
        const machine = this.machines.find(m => m.id === id);
        if (machine) {
            this.openVMModal(id);
        }
    }

    deleteVM(id) {
        this.tablet.showConfirm('Delete this vending machine?', (confirmed) => {
            if (confirmed) {
                this.machines = this.machines.filter(m => m.id !== id);
                this.saveMachines();
                this.renderMachines();
                this.tablet.showToast('Vending machine deleted', 'info');
            }
        });
    }

    restockVM(id) {
        const machine = this.machines.find(m => m.id === id);
        if (machine) {
            machine.kits.forEach(kit => {
                kit.stock = 10; // Default restock amount
            });
            machine.lastRestock = new Date().toISOString();
            this.saveMachines();
            this.renderMachines();
            this.tablet.showToast(`Restocked ${machine.name}`, 'success');
        }
    }

    editAssignment(vmId, kitId) {
        const vm = this.machines.find(m => m.id === vmId);
        const assign = vm.kits.find(k => k.kitId === kitId);
        if (assign) {
            this.editingVM = vm;
            this.editingKitId = kitId;
            this.populateKitSelect(assign);
            document.getElementById('kit-assign-modal').classList.remove('hidden');
        }
    }

    removeAssignment(vmId, kitId) {
        const vm = this.machines.find(m => m.id === vmId);
        vm.kits = vm.kits.filter(k => k.kitId !== kitId);
        this.saveMachines();
        this.renderMachines();
        this.tablet.showToast('Kit removed from VM', 'info');
    }

    refresh() {
        this.renderMachines();
        this.tablet.showToast('Vending machines refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kitVending = new KitVending(window.drainedTablet);
});