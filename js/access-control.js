// access-control.js – DRAINED TABLET ULTIMATE v7.0.0
// Simplified two‑role access control: master (CooseTheGeek) and server owners.

class AccessControl {
    constructor() {
        this.tablet = window.drainedTablet;
        this.auth = window.authSystem;
        this.roleHierarchy = {
            owner: 1,
            master: 2
        };
        this.masterUsername = 'CooseTheGeek'; // Hardcoded master
        this.init();
    }

    init() {
        console.log('AccessControl initialized');
    }

    // Check if current user is the master
    isMasterUser() {
        const username = AppState.user?.username || localStorage.getItem('tdl_username');
        return username === this.masterUsername;
    }

    // Get current user's role
    getCurrentRole() {
        if (this.isMasterUser()) return 'master';
        return AppState.user?.role || 'owner';
    }

    // Check if user has required role (master or owner)
    hasRole(requiredRole) {
        const currentRole = this.getCurrentRole();
        
        // Master has access to everything
        if (currentRole === 'master') return true;
        
        // Owners have access to owner-level features
        if (requiredRole === 'owner' && currentRole === 'owner') return true;
        
        // If required role is master, only master passes
        if (requiredRole === 'master') return currentRole === 'master';
        
        return false;
    }

    // Check if user is master
    isMaster() {
        return this.getCurrentRole() === 'master';
    }

    // Check if user is owner
    isOwner() {
        return this.getCurrentRole() === 'owner';
    }

    // Guard function – throws error if user lacks required role
    guard(requiredRole) {
        if (!this.hasRole(requiredRole)) {
            throw new Error(`Access denied: ${requiredRole} role required`);
        }
    }

    // Protect a function – returns wrapped function that checks role
    protect(fn, requiredRole) {
        return (...args) => {
            if (!this.hasRole(requiredRole)) {
                console.warn(`Access denied to function ${fn.name || 'anonymous'} – ${requiredRole} role required`);
                return null;
            }
            return fn(...args);
        };
    }

    // Apply UI permissions – hide elements based on role
    applyUIPermissions() {
        const currentRole = this.getCurrentRole();
        
        // Master sees everything – no hiding
        if (currentRole === 'master') {
            document.querySelectorAll('.master-only, .owner-only').forEach(el => {
                el.style.display = '';
            });
            return;
        }
        
        // Owners: hide master-only elements
        if (currentRole === 'owner') {
            document.querySelectorAll('.master-only').forEach(el => {
                el.style.display = 'none';
            });
            document.querySelectorAll('.owner-only').forEach(el => {
                el.style.display = '';
            });
        }
    }

    // Get visible tabs for current user (for dynamic sidebar generation)
    getVisibleTabs() {
        const allTabs = [
            { id: 'home', name: 'Home', icon: '🏠', roles: ['owner', 'master'] },
            { id: 'players-hub', name: 'Players Hub', icon: '👥', roles: ['owner', 'master'] },
            { id: 'server-management', name: 'Server Management', icon: '🖥️', roles: ['owner', 'master'] },
            { id: 'game-mechanics', name: 'Game Mechanics', icon: '⚙️', roles: ['owner', 'master'] },
            { id: 'tools-integration', name: 'Tools & Integration', icon: '🔧', roles: ['owner', 'master'] },
            { id: 'profile', name: 'Profile', icon: '👤', roles: ['owner', 'master'] },
            // Master-only tabs (for future use)
            { id: 'user-management', name: 'User Management', icon: '👥', roles: ['master'] },
            { id: 'audit', name: 'Audit Log', icon: '📋', roles: ['master'] }
        ];

        const currentRole = this.getCurrentRole();
        return allTabs.filter(tab => tab.roles.includes(currentRole));
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.accessControl = new AccessControl();
});