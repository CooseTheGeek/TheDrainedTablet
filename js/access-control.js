// access-control.js – DRAINED TABLET ULTIMATE v7.0.0
// Three‑tier role enforcement: User, Master, Owner.
// Provides permission checks for UI elements and command execution.

class AccessControl {
    constructor() {
        this.tablet = window.drainedTablet;
        this.auth = window.authSystem;
        this.roleHierarchy = {
            user: 1,
            owner: 2,
            master: 3
        };
        this.init();
    }

    init() {
        // No direct UI creation; this is a utility module.
        console.log('AccessControl initialized');
    }

    // Check if current user has at least the required role
    hasRole(requiredRole) {
        const currentRole = AppState.user.role || 'user';
        return this.roleHierarchy[currentRole] >= this.roleHierarchy[requiredRole];
    }

    // Check if current user is specifically a master (or owner)
    isMaster() {
        return AppState.user.role === 'master';
    }

    isOwner() {
        return AppState.user.role === 'owner';
    }

    // Guard function: throw error if insufficient role
    guard(requiredRole) {
        if (!this.hasRole(requiredRole)) {
            throw new Error(`Access denied: ${requiredRole} role required`);
        }
    }

    // Decorate a function with role check
    protect(fn, requiredRole) {
        return (...args) => {
            if (!this.hasRole(requiredRole)) {
                console.warn(`Access denied to function ${fn.name || 'anonymous'}`);
                return null;
            }
            return fn(...args);
        };
    }

    // Hide/show UI elements based on role
    applyUIPermissions() {
        // This can be called after login to hide elements the user shouldn't see.
        // Example: hide master-only tabs.
        if (!this.hasRole('master')) {
            document.querySelectorAll('.master-only').forEach(el => el.style.display = 'none');
        }
        if (!this.hasRole('owner')) {
            document.querySelectorAll('.owner-only').forEach(el => el.style.display = 'none');
        }
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.accessControl = new AccessControl();
});