import { db, auth } from './firebase-config.js';
import { ref, push, set, get, child, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { logout } from './auth.js';
import { logAction } from './logger.js';

let currentCompanyId = null;
let cart = [];
let products = [];

export async function initBilling() {
    const appDiv = document.getElementById('app');

    // Fetch user's company ID
    const dbRef = ref(db);
    const currentUser = auth.currentUser || JSON.parse(localStorage.getItem('userSession'));

    if (!currentUser) {
        alert("Session expired. Please login again.");
        window.location.href = '/';
        return;
    }

    const snapshot = await get(child(dbRef, `USER_DETAILS/${currentUser.uid}`));

    if (snapshot.exists()) {
        currentCompanyId = snapshot.val().COMPANY_SYS_ID;
    } else {
        alert("Error: User company not found.");
        return;
    }

    // Initialize Layout
    appDiv.innerHTML = `
        <div class="dashboard-layout">
            <aside class="sidebar">
                <div class="sidebar-header">
                    <h2>Sales</h2>
                </div>
                <nav class="sidebar-nav">
                    <button class="nav-item active" data-view="pos">POS</button>
                    <button class="nav-item" data-view="bills">Bills</button>
                </nav>
                <div class="sidebar-footer">
                    <div class="user-info-sm">${currentUser.email}</div>
                    <button id="logoutBtn" class="btn btn-danger btn-sm">Logout</button>
                </div>
            </aside>
            
            <main class="main-content">
                <div id="viewContainer">
                    <!-- Dynamic Content -->
                </div>
            </main>
        </div>
    `;

    // Event Listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);

    document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderView(e.target.dataset.view);
        });
    });

    // Initial View
    renderView('pos');
}

function renderView(viewName) {
    const container = document.getElementById('viewContainer');
    container.innerHTML = '<div class="loading">Loading...</div>';

    switch (viewName) {
        case 'pos': renderPosView(container); break;
        case 'bills': renderBillsView(container); break;
    }
}

// ==========================================
// BILLS VIEW
// ==========================================
async function renderBillsView(container) {
    container.innerHTML = `
        <div class="section-header"><h2>Bills History</h2></div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Mobile</th>
                        <th>Amount</th>
                        <th>Items</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="billsTableBody"><tr><td colspan="6">Loading...</td></tr></tbody>
            </table>
        </div>
    `;

    try {
        const snapshot = await get(child(ref(db), `BILL_DETAILS/${currentCompanyId}`));
        const tbody = document.getElementById('billsTableBody');
        tbody.innerHTML = '';

        if (!snapshot.exists()) {
            tbody.innerHTML = '<tr><td colspan="6">No bills found.</td></tr>';
            return;
        }

        const bills = [];
        snapshot.forEach(child => {
            bills.push({ id: child.key, ...child.val() });
        });

        // Sort by date desc
        bills.sort((a, b) => new Date(b.CREATED_DATE) - new Date(a.CREATED_DATE));

        bills.forEach(bill => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(bill.CREATED_DATE).toLocaleDateString()}</td>
                <td>${bill.CUSTOMER_NAME || 'Walk-in'}</td>
                <td>${bill.CUSTOMER_MOBILE || '-'}</td>
                <td>₹${bill.TOTAL_AMOUNT}</td>
                <td>${bill.ITEMS ? bill.ITEMS.length : 0}</td>
                <td><button class="btn-icon" onclick="alert('View Bill feature coming soon')">View</button></td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Error loading bills.</p>';
    }
}

// ==========================================
// POS VIEW
// ==========================================
function renderPosView(container) {
    container.innerHTML = `
        <div class="billing-container">
            <div class="products-panel">
                <div class="search-bar">
                    <input type="text" id="productSearch" class="form-input" placeholder="Search products...">
                </div>
                <div id="productsGrid" class="products-grid">
                    <div class="loading">Loading products...</div>
                </div>
            </div>
            
            <div class="cart-panel">
                <h2>Current Bill</h2>
                <div class="customer-details">
                    <input type="text" id="custName" class="form-input" placeholder="Customer Name">
                    <input type="tel" id="custPhone" class="form-input" placeholder="Phone Number">
                </div>
                
                <div class="cart-items" id="cartItems">
                    <!-- Cart items here -->
                    <div class="empty-cart">Cart is empty</div>
                </div>
                
                <div class="cart-footer">
                    <div class="total-row">
                        <span>Total:</span>
                        <span id="cartTotal">0.00</span>
                    </div>
                    <button id="printBtn" class="btn btn-primary full-width" disabled>Generate Bill & Print</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('productSearch').addEventListener('input', filterProducts);
    document.getElementById('printBtn').addEventListener('click', generateBill);

    // Restore cart state if switching back
    updateCartUI();
    loadProducts();
}

async function loadProducts() {
    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `PRODUCT_DETAILS/${currentCompanyId}`));

        products = [];

        if (snapshot.exists()) {
            const allProducts = snapshot.val();
            Object.keys(allProducts).forEach(key => {
                const prod = allProducts[key];
                if (prod.STATUS_SYS_ID == 1) { // Active only
                    products.push({ id: key, ...prod });
                }
            });
        }

        renderProducts(products);

    } catch (error) {
        console.error("Error loading products:", error);
        document.getElementById('productsGrid').innerHTML = '<div class="error">Error loading products</div>';
    }
}

function renderProducts(prods) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    if (prods.length === 0) {
        grid.innerHTML = '<div class="no-results">No products found</div>';
        return;
    }

    prods.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const imgHtml = prod.IMAGE_URL ? `<img src="${prod.IMAGE_URL}" alt="Prod" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem;">` : '';

        card.innerHTML = `
            ${imgHtml}
            <h3>${prod.PRODUCT_NAME}</h3>
            <div class="price">₹${prod.PRICE}</div>
            <div class="stock">Stock: ${prod.STOCK_COUNT}</div>
        `;
        card.addEventListener('click', () => addToCart(prod));
        grid.appendChild(card);
    });
}

function filterProducts(e) {
    const term = e.target.value.toLowerCase();
    const filtered = products.filter(p => p.PRODUCT_NAME.toLowerCase().includes(term));
    renderProducts(filtered);
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        if (existing.qty < product.STOCK_COUNT) {
            existing.qty++;
        } else {
            alert("Out of stock!");
            return;
        }
    } else {
        if (product.STOCK_COUNT > 0) {
            cart.push({ ...product, qty: 1 });
        } else {
            alert("Out of stock!");
            return;
        }
    }
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateQty(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        const newQty = item.qty + change;
        if (newQty > 0 && newQty <= item.STOCK_COUNT) {
            item.qty = newQty;
        } else if (newQty <= 0) {
            removeFromCart(productId);
            return; // UI updated in removeFromCart
        }
    }
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const printBtn = document.getElementById('printBtn');

    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart">Cart is empty</div>';
        totalEl.textContent = '0.00';
        printBtn.disabled = true;
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.PRICE * item.qty;
        total += itemTotal;

        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.PRODUCT_NAME}</div>
                <div class="item-price">₹${item.PRICE} x ${item.qty}</div>
            </div>
            <div class="item-actions">
                <button class="btn-qty minus">-</button>
                <span>${item.qty}</span>
                <button class="btn-qty plus">+</button>
                <button class="btn-remove">&times;</button>
            </div>
        `;

        row.querySelector('.minus').addEventListener('click', () => updateQty(item.id, -1));
        row.querySelector('.plus').addEventListener('click', () => updateQty(item.id, 1));
        row.querySelector('.btn-remove').addEventListener('click', () => removeFromCart(item.id));

        container.appendChild(row);
    });

    totalEl.textContent = total.toFixed(2);
    printBtn.disabled = false;
}

async function generateBill() {
    const custName = document.getElementById('custName').value;
    const custPhone = document.getElementById('custPhone').value;

    if (!custName) {
        alert("Please enter customer name");
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.PRICE * item.qty), 0);

    const billData = {
        CUSTOMER_NAME: custName,
        CUSTOMER_PHONE: custPhone,
        ITEMS: cart.map(i => ({
            PRODUCT_ID: i.id,
            NAME: i.PRODUCT_NAME,
            QTY: i.qty,
            PRICE: i.PRICE,
            TOTAL: i.PRICE * i.qty
        })),
        TOTAL_AMOUNT: total,
        CREATED_BY: (auth.currentUser || JSON.parse(localStorage.getItem('userSession'))).uid,
        CREATED_DATE: new Date().toISOString(),
        STATUS_SYS_ID: 1
    };

    try {
        // Save Bill
        const newBillRef = push(ref(db, `BILL_DETAILS/${currentCompanyId}`));
        billData.SYS_ID = newBillRef.key;
        billData.BILL_NO = newBillRef.key; // TODO: Implement auto-increment logic if strictly needed
        await set(newBillRef, billData);

        logAction("CREATE", "BILL_DETAILS", newBillRef.key, billData);

        // Update stock
        for (const item of cart) {
            const newStock = item.STOCK_COUNT - item.qty;
            await update(ref(db, `PRODUCT_DETAILS/${currentCompanyId}/${item.id}`), {
                STOCK_COUNT: newStock,
                UPDATED_DATE: new Date().toISOString()
            });
        }

        // Print
        printBill(billData, newBillRef.key);

        // Reset
        cart = [];
        updateCartUI();
        document.getElementById('custName').value = '';
        document.getElementById('custPhone').value = '';
        loadProducts(); // Refresh stock

    } catch (error) {
        console.error("Error generating bill:", error);
        alert("Error generating bill");
    }
}

function printBill(billData, billId) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Bill #${billId}</title>
            <style>
                body { font-family: sans-serif; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .meta { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border-bottom: 1px solid #ddd; padding: 8px; text-align: left; }
                .total { text-align: right; font-size: 1.2em; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>INVOICE</h1>
                <p>Bill ID: ${billId}</p>
            </div>
            <div class="meta">
                <p><strong>Customer:</strong> ${billData.CUSTOMER_NAME}</p>
                <p><strong>Phone:</strong> ${billData.CUSTOMER_PHONE}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${billData.ITEMS.map(item => `
                        <tr>
                            <td>${item.NAME}</td>
                            <td>${item.QTY}</td>
                            <td>${item.PRICE}</td>
                            <td>${item.TOTAL}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="total">
                Total: ₹${billData.TOTAL_AMOUNT.toFixed(2)}
            </div>
            <script>
                window.onload = function() { window.print(); window.close(); }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}
