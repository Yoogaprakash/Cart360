import { db, auth, storage } from './firebase-config.js';
import { ref, push, set, get, child, update, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { logout } from './auth.js';
import { logAction } from './logger.js';

let currentView = 'companies';

export function initSuperAdmin() {
    const appDiv = document.getElementById('app');
    const currentUser = auth.currentUser || JSON.parse(localStorage.getItem('userSession'));

    appDiv.innerHTML = `
        <div class="dashboard-layout">
            <aside class="sidebar collapsed" id="sidebar">
                <div class="sidebar-header">
                    <div class="logo-area">
                        <img src="https://via.placeholder.com/40" alt="Logo" id="sidebarLogo" style="cursor: pointer;">
                        <h2>Super Admin</h2>
                    </div>
                    <button class="sidebar-toggle" id="sidebarToggle">☰</button>
                </div>
                <nav class="sidebar-nav">
                    <button class="nav-item active" data-view="companies" data-icon="🏢"><span>Companies</span></button>
                    <button class="nav-item" data-view="users" data-icon="👥"><span>Users</span></button>
                    <button class="nav-item" data-view="products" data-icon="📦"><span>Products</span></button>
                    <button class="nav-item" data-view="categories" data-icon="📂"><span>Categories</span></button>
                </nav>
                <div class="sidebar-footer">
                    <div class="user-info-sm">${currentUser?.email}</div>
                    <button id="logoutBtn" class="btn btn-danger btn-sm">
                        <span class="icon-content">⏻</span>
                        <span class="text-content">Logout</span>
                    </button>
                </div>
            </aside>
            
            <main class="main-content">
                <div id="viewContainer">
                    <!-- Dynamic Content Loaded Here -->
                </div>
            </main>

            <!-- Shared Modal Container -->
            <div id="sharedModal" class="modal hidden">
                <div class="modal-content" id="modalContent">
                    <!-- Dynamic Modal Content -->
                </div>
            </div>
        </div>
    `;

    // Event Listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('sidebarToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });
    document.getElementById('sidebarLogo').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentView = e.target.dataset.view;
            renderView();
        });
    });

    // Auto-collapse on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('collapsed');
    }

    renderView();
}

function renderView() {
    const container = document.getElementById('viewContainer');
    container.innerHTML = '<div class="loading">Loading view...</div>';

    switch (currentView) {
        case 'companies': renderCompaniesView(container); break;
        case 'users': renderUsersView(container); break;
        case 'products': renderProductsView(container); break;
        case 'categories': renderCategoriesView(container); break;
    }
}

// ==========================================
// COMPANIES VIEW
// ==========================================
async function renderCompaniesView(container) {
    container.innerHTML = `
        <div class="section-header">
            <h2>Company Details</h2>
            <button id="addCompanyBtn" class="btn btn-primary">Add Company</button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Company Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="companiesTableBody"><tr><td colspan="5">Loading...</td></tr></tbody>
            </table>
        </div>
    `;

    document.getElementById('addCompanyBtn').addEventListener('click', () => openCompanyModal());
    loadCompanies();
}

async function loadCompanies() {
    const tbody = document.getElementById('companiesTableBody');
    if (!tbody) return;

    try {
        const snapshot = await get(child(ref(db), `COMPANY_DETAILS`));
        tbody.innerHTML = '';

        if (!snapshot.exists()) {
            tbody.innerHTML = '<tr><td colspan="5">No companies found.</td></tr>';
            return;
        }

        const companies = snapshot.val();
        Object.keys(companies).forEach((key) => {
            const data = companies[key];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.COMPANY_NAME}</td>
                <td>${data.EMAIL}</td>
                <td>${getStatusBadge(data.STATUS_SYS_ID)}</td>
                <td>${formatDate(data.CREATED_DATE)}</td>
                <td>
                    <button class="btn-icon edit-btn" data-id="${key}">Edit</button>
                    <button class="btn-icon delete-btn" data-id="${key}">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        tbody.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => openCompanyModal(e.target.dataset.id)));
        tbody.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => softDeleteCompany(e.target.dataset.id)));

    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5">Error loading data.</td></tr>';
    }
}

function openCompanyModal(sysId = null) {
    const modal = document.getElementById('sharedModal');
    const content = document.getElementById('modalContent');
    modal.classList.remove('hidden');

    content.innerHTML = `
        <h2 id="modalTitle">${sysId ? 'Edit' : 'Add'} Company</h2>
        <form id="companyForm">
            <input type="hidden" id="sysId" value="${sysId || ''}">
            <div class="form-grid">
                <div class="form-group"><label class="form-label">Company Name</label><input type="text" id="companyName" class="form-input" required></div>
                <div class="form-group"><label class="form-label">Email</label><input type="email" id="companyEmail" class="form-input" required></div>
                <div class="form-group"><label class="form-label">Phone</label><input type="tel" id="companyPhone" class="form-input"></div>
                <div class="form-group"><label class="form-label">GST No</label><input type="text" id="gstNo" class="form-input"></div>
                <div class="form-group"><label class="form-label">UPI ID</label><input type="text" id="upiId" class="form-input"></div>
                <div class="form-group"><label class="form-label">GST Flag</label><select id="gstFlag" class="form-input"><option value="1">Enabled</option><option value="0">Disabled</option></select></div>
                <div class="form-group"><label class="form-label">Status</label><select id="companyStatus" class="form-input"><option value="1">Active</option><option value="2">Inactive</option><option value="3">Deleted</option></select></div>
                <div class="form-group full-width"><label class="form-label">Address</label><textarea id="companyAddress" class="form-input" rows="2"></textarea></div>
                <div class="form-group full-width"><label class="form-label">Notes</label><textarea id="notes" class="form-input" rows="2"></textarea></div>
            </div>
            <div class="modal-actions"><button type="button" id="cancelBtn" class="btn">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div>
        </form>
    `;

    document.getElementById('cancelBtn').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('companyForm').addEventListener('submit', handleCompanySubmit);

    if (sysId) {
        get(child(ref(db), `COMPANY_DETAILS/${sysId}`)).then(snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                document.getElementById('companyName').value = data.COMPANY_NAME;
                document.getElementById('companyEmail').value = data.EMAIL;
                document.getElementById('companyPhone').value = data.PHONE_NO || '';
                document.getElementById('companyAddress').value = data.ADDRESS || '';
                document.getElementById('gstNo').value = data.GST_NO || '';
                document.getElementById('upiId').value = data.UPI_ID || '';
                document.getElementById('gstFlag').value = data.GST_FLAG || '1';
                document.getElementById('notes').value = data.NOTES || '';
                document.getElementById('companyStatus').value = data.STATUS_SYS_ID;
            }
        });
    }
}

async function handleCompanySubmit(e) {
    e.preventDefault();
    const id = document.getElementById('sysId').value;
    const data = {
        COMPANY_NAME: document.getElementById('companyName').value,
        EMAIL: document.getElementById('companyEmail').value,
        PHONE_NO: document.getElementById('companyPhone').value,
        ADDRESS: document.getElementById('companyAddress').value,
        GST_NO: document.getElementById('gstNo').value,
        UPI_ID: document.getElementById('upiId').value,
        GST_FLAG: parseInt(document.getElementById('gstFlag').value),
        NOTES: document.getElementById('notes').value,
        STATUS_SYS_ID: parseInt(document.getElementById('companyStatus').value),
        UPDATED_DATE: new Date().toISOString()
    };

    try {
        if (id) {
            await update(ref(db, `COMPANY_DETAILS/${id}`), data);
            logAction("UPDATE", "COMPANY_DETAILS", id, data);
        } else {
            data.CREATED_DATE = new Date().toISOString();
            data.VERSION_NO = 1;
            data.NO_OF_USER = 0;
            const newRef = push(ref(db, 'COMPANY_DETAILS'));
            data.SYS_ID = newRef.key;
            data.COMPANY_ID = newRef.key;
            await set(newRef, data);
            logAction("CREATE", "COMPANY_DETAILS", newRef.key, data);
        }
        document.getElementById('sharedModal').classList.add('hidden');
        loadCompanies();
    } catch (error) {
        console.error(error);
        alert("Error saving company");
    }
}

async function softDeleteCompany(id) {
    if (!confirm("Are you sure?")) return;
    await update(ref(db, `COMPANY_DETAILS/${id}`), { STATUS_SYS_ID: 3 });
    logAction("DELETE", "COMPANY_DETAILS", id, { status: "Deleted" });
    loadCompanies();
}

// ==========================================
// USERS VIEW
// ==========================================
async function renderUsersView(container) {
    container.innerHTML = `
        <div class="section-header">
            <h2>User Details</h2>
            <button id="addUserBtn" class="btn btn-primary">Add User</button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>User Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Company</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="usersTableBody"><tr><td colspan="6">Loading...</td></tr></tbody>
            </table>
        </div>
    `;
    document.getElementById('addUserBtn').addEventListener('click', () => openUserModal());
    loadUsers();
}

async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    try {
        const [usersSnap, companiesSnap] = await Promise.all([
            get(child(ref(db), `USER_DETAILS`)),
            get(child(ref(db), `COMPANY_DETAILS`))
        ]);

        const companies = companiesSnap.exists() ? companiesSnap.val() : {};

        tbody.innerHTML = '';
        if (!usersSnap.exists()) {
            tbody.innerHTML = '<tr><td colspan="6">No users found.</td></tr>';
            return;
        }

        const users = usersSnap.val();
        Object.keys(users).forEach(key => {
            const data = users[key];
            const companyName = data.COMPANY_SYS_ID ? (companies[data.COMPANY_SYS_ID]?.COMPANY_NAME || 'Unknown') : '-';
            let roleName = 'Unknown';
            if (data.ROLE_SYS_ID == 1) roleName = 'Super Admin';
            if (data.ROLE_SYS_ID == 2) roleName = 'Admin';
            if (data.ROLE_SYS_ID == 3) roleName = 'Employee';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.USER_NAME}</td>
                <td>${data.USER_ID}</td>
                <td>${roleName}</td>
                <td>${companyName}</td>
                <td>${getStatusBadge(data.STATUS_SYS_ID)}</td>
                <td>
                    <button class="btn-icon edit-user-btn" data-id="${key}">Edit</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        tbody.querySelectorAll('.edit-user-btn').forEach(btn => btn.addEventListener('click', (e) => openUserModal(e.target.dataset.id)));

    } catch (error) {
        console.error(error);
    }
}

async function openUserModal(sysId = null) {
    const modal = document.getElementById('sharedModal');
    const content = document.getElementById('modalContent');
    modal.classList.remove('hidden');

    // Fetch companies for dropdown
    const companiesSnap = await get(child(ref(db), `COMPANY_DETAILS`));
    let companyOptions = '<option value="">Select Company</option>';
    if (companiesSnap.exists()) {
        const companies = companiesSnap.val();
        Object.keys(companies).forEach(key => {
            if (companies[key].STATUS_SYS_ID == 1) {
                companyOptions += `<option value="${key}">${companies[key].COMPANY_NAME}</option>`;
            }
        });
    }

    content.innerHTML = `
        <h2 id="modalTitle">${sysId ? 'Edit' : 'Add'} User</h2>
        <form id="userForm">
            <input type="hidden" id="sysId" value="${sysId || ''}">
            <div class="form-group"><label class="form-label">User Name</label><input type="text" id="userName" class="form-input" required></div>
            <div class="form-group"><label class="form-label">Email (User ID)</label><input type="email" id="userEmail" class="form-input" required ${sysId ? 'readonly' : ''}></div>
            ${!sysId ? '<div class="form-group"><label class="form-label">Password</label><input type="password" id="userPass" class="form-input" required></div>' : ''}
            <div class="form-group"><label class="form-label">Role</label><select id="userRole" class="form-input"><option value="2">Admin</option><option value="3">Employee</option></select></div>
            <div class="form-group"><label class="form-label">Company</label><select id="userCompany" class="form-input">${companyOptions}</select></div>
            <div class="form-group"><label class="form-label">Status</label><select id="userStatus" class="form-input"><option value="1">Active</option><option value="2">Inactive</option></select></div>
            <div class="modal-actions"><button type="button" id="cancelBtn" class="btn">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div>
        </form>
    `;

    document.getElementById('cancelBtn').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('userForm').addEventListener('submit', handleUserSubmit);

    if (sysId) {
        get(child(ref(db), `USER_DETAILS/${sysId}`)).then(snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                document.getElementById('userName').value = data.USER_NAME;
                document.getElementById('userEmail').value = data.USER_ID;
                document.getElementById('userRole').value = data.ROLE_SYS_ID;
                document.getElementById('userCompany').value = data.COMPANY_SYS_ID || '';
                document.getElementById('userStatus').value = data.STATUS_SYS_ID;
            }
        });
    }
}

async function handleUserSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('sysId').value;
    const data = {
        USER_NAME: document.getElementById('userName').value,
        ROLE_SYS_ID: parseInt(document.getElementById('userRole').value),
        COMPANY_SYS_ID: document.getElementById('userCompany').value,
        STATUS_SYS_ID: parseInt(document.getElementById('userStatus').value),
        UPDATED_DATE: new Date().toISOString(),
        UPDATED_USER_SYS_ID: auth.currentUser.uid
    };

    try {
        if (id) {
            await update(ref(db, `USER_DETAILS/${id}`), data);
            logAction("UPDATE", "USER_DETAILS", id, data);
        } else {
            // Store password for DB-based auth (fallback)
            const password = document.getElementById('userPass').value;
            data.PASSWORD = password; // Note: In a real app, hash this!

            data.USER_ID = document.getElementById('userEmail').value;
            data.CREATED_DATE = new Date().toISOString();
            data.VERSION_NO = 1;

            const newRef = push(ref(db, 'USER_DETAILS'));
            data.SYS_ID = newRef.key;
            await set(newRef, data);
            logAction("CREATE", "USER_DETAILS", newRef.key, { ...data, PASSWORD: '***' });
        }
        document.getElementById('sharedModal').classList.add('hidden');
        loadUsers();
    } catch (error) {
        console.error(error);
        alert("Error saving user");
    }
}


// ==========================================
// PRODUCTS VIEW
// ==========================================
async function renderProductsView(container) {
    // Fetch companies first
    const companiesSnap = await get(child(ref(db), `COMPANY_DETAILS`));
    let companyOptions = '<option value="">Select Company</option>';
    if (companiesSnap.exists()) {
        const companies = companiesSnap.val();
        Object.keys(companies).forEach(key => {
            companyOptions += `<option value="${key}">${companies[key].COMPANY_NAME}</option>`;
        });
    }

    container.innerHTML = `
        <div class="section-header">
            <h2>Products</h2>
            <div style="display:flex; gap:10px;">
                <select id="filterCompany" class="form-input" style="width:200px;">${companyOptions}</select>
                <button id="addProductBtn" class="btn btn-primary" disabled>Add Product</button>
            </div>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="productsTableBody"><tr><td colspan="6">Select a company to view products.</td></tr></tbody>
            </table>
        </div>
    `;

    const filter = document.getElementById('filterCompany');
    const addBtn = document.getElementById('addProductBtn');

    filter.addEventListener('change', (e) => {
        const companyId = e.target.value;
        addBtn.disabled = !companyId;
        if (companyId) loadProducts(companyId);
        else document.getElementById('productsTableBody').innerHTML = '<tr><td colspan="6">Select a company to view products.</td></tr>';
    });

    addBtn.addEventListener('click', () => openProductModal(null, filter.value));
}

async function loadProducts(companyId) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';

    try {
        const snapshot = await get(child(ref(db), `PRODUCT_DETAILS/${companyId}`));
        tbody.innerHTML = '';

        if (!snapshot.exists()) {
            tbody.innerHTML = '<tr><td colspan="6">No products found.</td></tr>';
            return;
        }

        const products = snapshot.val();
        Object.keys(products).forEach(key => {
            const data = products[key];
            const imgHtml = data.IMAGE_URL ? `<img src="${data.IMAGE_URL}" style="width:40px;height:40px;object-fit:cover;">` : '-';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${imgHtml}</td>
                <td>${data.PRODUCT_NAME}</td>
                <td>${data.PRICE}</td>
                <td>${data.STOCK_COUNT}</td>
                <td>${getStatusBadge(data.STATUS_SYS_ID)}</td>
                <td><button class="btn-icon edit-prod-btn" data-id="${key}">Edit</button></td>
            `;
            tbody.appendChild(row);
        });

        tbody.querySelectorAll('.edit-prod-btn').forEach(btn => btn.addEventListener('click', (e) => openProductModal(e.target.dataset.id, companyId)));

    } catch (error) {
        console.error(error);
    }
}

async function openProductModal(sysId, companyId) {
    const modal = document.getElementById('sharedModal');
    const content = document.getElementById('modalContent');
    modal.classList.remove('hidden');

    // Fetch categories for this company
    const catSnap = await get(child(ref(db), `CATEGORY_DETAILS/${companyId}`));
    let catOptions = '<option value="">Select Category</option>';
    if (catSnap.exists()) {
        const cats = catSnap.val();
        Object.keys(cats).forEach(key => {
            if (cats[key].STATUS_SYS_ID == 1) catOptions += `<option value="${key}">${cats[key].CATEGORY_NAME}</option>`;
        });
    }

    content.innerHTML = `
        <h2 id="modalTitle">${sysId ? 'Edit' : 'Add'} Product</h2>
        <form id="productForm">
            <input type="hidden" id="sysId" value="${sysId || ''}">
            <div class="form-grid">
                <div class="form-group"><label class="form-label">Name</label><input type="text" id="prodName" class="form-input" required></div>
                <div class="form-group"><label class="form-label">Category</label><select id="prodCategory" class="form-input" required>${catOptions}</select></div>
                <div class="form-group"><label class="form-label">Price</label><input type="number" id="prodPrice" class="form-input" step="0.01" required></div>
                <div class="form-group"><label class="form-label">Stock</label><input type="number" id="prodStock" class="form-input" required></div>
                <div class="form-group"><label class="form-label">Image</label><input type="file" id="prodImage" class="form-input"><input type="hidden" id="prodImageUrl"></div>
                <div class="form-group"><label class="form-label">Status</label><select id="prodStatus" class="form-input"><option value="1">Active</option><option value="2">Inactive</option></select></div>
            </div>
            <div class="modal-actions"><button type="button" id="cancelBtn" class="btn">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div>
        </form>
    `;

    document.getElementById('cancelBtn').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('productForm').addEventListener('submit', (e) => handleProductSubmit(e, companyId));

    if (sysId) {
        get(child(ref(db), `PRODUCT_DETAILS/${companyId}/${sysId}`)).then(snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                document.getElementById('prodName').value = data.PRODUCT_NAME;
                document.getElementById('prodCategory').value = data.CATEGORY_SYS_ID;
                document.getElementById('prodPrice').value = data.PRICE;
                document.getElementById('prodStock').value = data.STOCK_COUNT;
                document.getElementById('prodStatus').value = data.STATUS_SYS_ID;
                document.getElementById('prodImageUrl').value = data.IMAGE_URL || '';
            }
        });
    }
}

async function handleProductSubmit(e, companyId) {
    e.preventDefault();
    const id = document.getElementById('sysId').value;
    const imageFile = document.getElementById('prodImage').files[0];
    let imageUrl = document.getElementById('prodImageUrl').value;

    if (imageFile) {
        const storageRef = sRef(storage, `products/${companyId}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
    }

    const data = {
        PRODUCT_NAME: document.getElementById('prodName').value,
        CATEGORY_SYS_ID: document.getElementById('prodCategory').value,
        PRICE: parseFloat(document.getElementById('prodPrice').value),
        STOCK_COUNT: parseInt(document.getElementById('prodStock').value),
        IMAGE_URL: imageUrl,
        STATUS_SYS_ID: parseInt(document.getElementById('prodStatus').value),
        UPDATED_DATE: new Date().toISOString(),
        UPDATED_USER_SYS_ID: auth.currentUser.uid
    };

    try {
        if (id) {
            await update(ref(db, `PRODUCT_DETAILS/${companyId}/${id}`), data);
            logAction("UPDATE", "PRODUCT_DETAILS", id, data);
        } else {
            data.CREATED_DATE = new Date().toISOString();
            data.VERSION_NO = 1;
            const newRef = push(ref(db, `PRODUCT_DETAILS/${companyId}`));
            data.SYS_ID = newRef.key;
            await set(newRef, data);
            logAction("CREATE", "PRODUCT_DETAILS", newRef.key, data);
        }
        document.getElementById('sharedModal').classList.add('hidden');
        loadProducts(companyId);
    } catch (error) {
        console.error(error);
        alert("Error saving product");
    }
}

// ==========================================
// CATEGORIES VIEW
// ==========================================
async function renderCategoriesView(container) {
    const companiesSnap = await get(child(ref(db), `COMPANY_DETAILS`));
    let companyOptions = '<option value="">Select Company</option>';
    if (companiesSnap.exists()) {
        const companies = companiesSnap.val();
        Object.keys(companies).forEach(key => {
            companyOptions += `<option value="${key}">${companies[key].COMPANY_NAME}</option>`;
        });
    }

    container.innerHTML = `
        <div class="section-header">
            <h2>Categories</h2>
            <div style="display:flex; gap:10px;">
                <select id="filterCompanyCat" class="form-input" style="width:200px;">${companyOptions}</select>
                <button id="addCatBtn" class="btn btn-primary" disabled>Add Category</button>
            </div>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="catsTableBody"><tr><td colspan="3">Select a company to view categories.</td></tr></tbody>
            </table>
        </div>
    `;

    const filter = document.getElementById('filterCompanyCat');
    const addBtn = document.getElementById('addCatBtn');

    filter.addEventListener('change', (e) => {
        const companyId = e.target.value;
        addBtn.disabled = !companyId;
        if (companyId) loadCategories(companyId);
        else document.getElementById('catsTableBody').innerHTML = '<tr><td colspan="3">Select a company to view categories.</td></tr>';
    });

    addBtn.addEventListener('click', () => openCategoryModal(null, filter.value));
}

async function loadCategories(companyId) {
    const tbody = document.getElementById('catsTableBody');
    tbody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';

    try {
        const snapshot = await get(child(ref(db), `CATEGORY_DETAILS/${companyId}`));
        tbody.innerHTML = '';

        if (!snapshot.exists()) {
            tbody.innerHTML = '<tr><td colspan="3">No categories found.</td></tr>';
            return;
        }

        const cats = snapshot.val();
        Object.keys(cats).forEach(key => {
            const data = cats[key];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.CATEGORY_NAME}</td>
                <td>${getStatusBadge(data.STATUS_SYS_ID)}</td>
                <td><button class="btn-icon edit-cat-btn" data-id="${key}">Edit</button></td>
            `;
            tbody.appendChild(row);
        });

        tbody.querySelectorAll('.edit-cat-btn').forEach(btn => btn.addEventListener('click', (e) => openCategoryModal(e.target.dataset.id, companyId)));

    } catch (error) {
        console.error(error);
    }
}

function openCategoryModal(sysId, companyId) {
    const modal = document.getElementById('sharedModal');
    const content = document.getElementById('modalContent');
    modal.classList.remove('hidden');

    content.innerHTML = `
        <h2 id="modalTitle">${sysId ? 'Edit' : 'Add'} Category</h2>
        <form id="catForm">
            <input type="hidden" id="sysId" value="${sysId || ''}">
            <div class="form-group"><label class="form-label">Name</label><input type="text" id="catName" class="form-input" required></div>
            <div class="form-group"><label class="form-label">Status</label><select id="catStatus" class="form-input"><option value="1">Active</option><option value="2">Inactive</option></select></div>
            <div class="modal-actions"><button type="button" id="cancelBtn" class="btn">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div>
        </form>
    `;

    document.getElementById('cancelBtn').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('catForm').addEventListener('submit', (e) => handleCategorySubmit(e, companyId));

    if (sysId) {
        get(child(ref(db), `CATEGORY_DETAILS/${companyId}/${sysId}`)).then(snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                document.getElementById('catName').value = data.CATEGORY_NAME;
                document.getElementById('catStatus').value = data.STATUS_SYS_ID;
            }
        });
    }
}

async function handleCategorySubmit(e, companyId) {
    e.preventDefault();
    const id = document.getElementById('sysId').value;
    const data = {
        CATEGORY_NAME: document.getElementById('catName').value,
        STATUS_SYS_ID: parseInt(document.getElementById('catStatus').value),
        UPDATED_DATE: new Date().toISOString(),
        UPDATED_USER_SYS_ID: auth.currentUser.uid
    };

    try {
        if (id) {
            await update(ref(db, `CATEGORY_DETAILS/${companyId}/${id}`), data);
            logAction("UPDATE", "CATEGORY_DETAILS", id, data);
        } else {
            data.CREATED_DATE = new Date().toISOString();
            data.VERSION_NO = 1;
            const newRef = push(ref(db, `CATEGORY_DETAILS/${companyId}`));
            data.SYS_ID = newRef.key;
            await set(newRef, data);
            logAction("CREATE", "CATEGORY_DETAILS", newRef.key, data);
        }
        document.getElementById('sharedModal').classList.add('hidden');
        loadCategories(companyId);
    } catch (error) {
        console.error(error);
        alert("Error saving category");
    }
}

// Helper
function getStatusBadge(statusId) {
    if (statusId == 1) return '<span class="status-badge status-active">Active</span>';
    if (statusId == 2) return '<span class="status-badge status-inactive">Inactive</span>';
    if (statusId == 3) return '<span class="status-badge status-deleted">Deleted</span>';
    return 'Unknown';
}

function formatDate(isoString) {
    return isoString ? new Date(isoString).toLocaleDateString() : '-';
}
