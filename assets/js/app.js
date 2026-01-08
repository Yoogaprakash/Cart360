import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Simple Router (Hash-based)
const routes = {
    '/': { template: 'login', title: 'Login' },
    '/dashboard': { template: 'dashboard', title: 'Dashboard' },
    '/super-admin': { template: 'super-admin', title: 'Super Admin Dashboard' },
    '/admin': { template: 'admin', title: 'Admin Dashboard' },
    '/billing': { template: 'billing', title: 'Billing' }
};

const appDiv = document.getElementById('app');

function navigateTo(path) {
    window.location.hash = path;
}

function handleRoute() {
    // Get path from hash, default to '/'
    const path = window.location.hash.slice(1) || '/';

    // Handle root path or undefined paths
    if (path === '/' || !routes[path]) {
        if (auth.currentUser || localStorage.getItem('userSession')) {
            // If logged in, redirect based on role (logic handled in auth.js)
            // But we need to trigger the check. 
            // For now, if we are at root and logged in, let the auth listener handle redirect.
            // If we are at an unknown route, go to root.
            if (path !== '/') window.location.hash = '/';
        } else {
            renderLogin();
        }
        return;
    }

    // Render other routes
    const currentUser = auth.currentUser || JSON.parse(localStorage.getItem('userSession'));

    if (path === '/super-admin') {
        // Check auth (basic check)
        if (!currentUser) {
            navigateTo('/');
            return;
        }

        // Dynamic import
        import('./super-admin.js').then(module => {
            module.initSuperAdmin();
        });
        return;
    }

    // Admin Route
    if (path === '/admin') {
        if (!currentUser) { navigateTo('/'); return; }
        import('./admin.js').then(module => module.initAdmin());
        return;
    }

    // Billing Route
    if (path === '/billing') {
        if (!currentUser) { navigateTo('/'); return; }
        import('./admin.js').then(module => module.initAdmin());
        return;
    }
}

function renderLogin() {
    document.title = 'Login - Cart360';
    appDiv.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <span class="auth-logo">Cart360</span>
                <p class="auth-subtitle">Sign in to your account</p>
                
                <form id="loginForm" class="auth-form">
                    <div class="form-group">
                        <label class="form-label" for="email">Email Address</label>
                        <input type="email" id="email" class="form-input" placeholder="name@company.com" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="password">Password</label>
                        <input type="password" id="password" class="form-input" placeholder="••••••••" required>
                    </div>
                    
                    <div id="loginError" class="auth-error"></div>
                    
                    <button type="submit" class="btn btn-primary auth-btn">Sign In</button>
                </form>
            </div>
        </div>
    `;

    // Dynamically import auth.js to attach listeners
    import('./auth.js').then(module => {
        module.setupLoginListener();
    });
}

// Handle hash change
window.addEventListener('hashchange', handleRoute);

// Initial load
window.addEventListener('DOMContentLoaded', () => {
    // Check local session first (for DB auth users)
    const localSession = localStorage.getItem('userSession');

    // If we have a session, we might need to redirect if at root
    if (localSession) {
        const user = JSON.parse(localSession);
        const currentHash = window.location.hash.slice(1) || '/';

        if (currentHash === '/') {
            import('./auth.js').then(module => {
                module.redirectUserBasedOnRole(user);
            });
        } else {
            handleRoute();
        }
        return;
    }

    // Listen for auth state changes (for Firebase Auth users)
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in.
            const currentHash = window.location.hash.slice(1) || '/';
            if (currentHash === '/') {
                // If on login page, redirect to dashboard
                import('./auth.js').then(module => {
                    module.redirectUserBasedOnRole(user);
                });
            } else {
                // If on a protected route, just ensure the view is rendered
                handleRoute();
            }
        } else {
            // User is signed out.
            const currentHash = window.location.hash.slice(1) || '/';
            if (currentHash !== '/') {
                navigateTo('/');
            } else {
                handleRoute();
            }
        }
    });

    // Trigger initial route if no auth check needed immediately (e.g. if we are at login)
    if (!localSession) {
        handleRoute();
    }
});

export { navigateTo };
