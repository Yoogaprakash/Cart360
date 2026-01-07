import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, get, child, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { navigateTo } from './app.js';

export function setupLoginListener() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Reset error
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    // Loading state
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Signing in...';
    submitBtn.disabled = true;

    try {
        // Try Firebase Auth first
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Logged in via Firebase Auth:", user.uid);
            await redirectUserBasedOnRole(user);
            return;
        } catch (authError) {
            console.log("Firebase Auth failed, trying DB Auth...", authError.code);
            // If not found or invalid password in Auth, try DB
        }

        // DB Auth Fallback
        const dbRef = ref(db);
        // Fetch all users and filter client-side to avoid "Index not defined" error
        // Note: For large datasets, you should add ".indexOn": "USER_ID" to Firebase Rules and use query()
        const snapshot = await get(child(dbRef, 'USER_DETAILS'));

        if (snapshot.exists()) {
            let validUser = null;
            snapshot.forEach(childSnapshot => {
                const userData = childSnapshot.val();
                // Check for matching email (USER_ID) and password
                if (userData.USER_ID === email && userData.PASSWORD === password) {
                    validUser = userData;
                }
            });

            if (validUser) {
                console.log("Logged in via DB Auth:", validUser.SYS_ID);
                // Create a local session
                const sessionUser = {
                    uid: validUser.SYS_ID,
                    email: validUser.USER_ID,
                    isDbAuth: true
                };
                localStorage.setItem('userSession', JSON.stringify(sessionUser));
                await redirectUserBasedOnRole(sessionUser);
            } else {
                throw new Error("Invalid password");
            }
        } else {
            throw new Error("User not found");
        }

    } catch (error) {
        console.error("Login error:", error);
        errorDiv.textContent = "Invalid email or password.";
        errorDiv.style.display = 'block';
    } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
}

export async function redirectUserBasedOnRole(user) {
    // Check if it's the specific super admin email
    if (user.email === 'kyp.nkl@gmail.com') {
        console.log("Super Admin detected");
        navigateTo('/super-admin');
        return;
    }

    // Fetch role from Realtime Database (USER_DETAILS)
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `USER_DETAILS/${user.uid}`));

    if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log("User Role:", userData.ROLE_SYS_ID);

        if (userData.ROLE_SYS_ID == 2) {
            navigateTo('/admin');
        } else if (userData.ROLE_SYS_ID == 3) {
            navigateTo('/admin');
        } else {
            alert("Unknown role");
        }
    } else {
        console.error("No user document found!");
        alert("User setup incomplete. Please contact admin.");
    }
}

export async function logout() {
    try {
        localStorage.removeItem('userSession');
        await signOut(auth);
        navigateTo('/');
    } catch (error) {
        console.error("Logout error:", error);
    }
}
