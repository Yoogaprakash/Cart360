import { db, auth, storage } from './firebase-config.js';
import { ref, push, set, get, child, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { logout } from './auth.js';
import { logAction } from './logger.js';

let currentCompanyId = null;
let currentUserRole = null;
let cart = [];
let posProducts = [];
let companyData = {};

export async function initAdmin() {
    const appDiv = document.getElementById('app');

    // Fetch user's company ID and Role
    const dbRef = ref(db);
    const currentUser = auth.currentUser || JSON.parse(localStorage.getItem('userSession'));

    if (!currentUser) {
        alert("Session expired. Please login again.");
        window.location.href = '/';
        return;
    }

    const snapshot = await get(child(dbRef, `USER_DETAILS/${currentUser.uid}`));

    if (snapshot.exists()) {
        const userData = snapshot.val();
        currentCompanyId = userData.COMPANY_SYS_ID;
        currentUserRole = userData.ROLE_SYS_ID; // 2: Admin, 3: Employee
    } else {
        alert("Error: User details not found.");
        return;
    }

    // Fetch Company Details for Sidebar
    const compSnap = await get(child(dbRef, `COMPANY_DETAILS/${currentCompanyId}`));
    companyData = compSnap.exists() ? compSnap.val() : {};
    const companyName = companyData.COMPANY_NAME || (currentUserRole == 2 ? 'Admin' : 'Sales');
    const companyLogo = companyData.LOGO_URL || 'https://via.placeholder.com/40';

    // Define Menu Items based on Role
    let menuItems = '';
    if (currentUserRole == 2) { // Admin
        menuItems = `
            <button class="nav-item active" data-view="company" data-icon="🏢"><span>Company</span></button>
            <button class="nav-item" data-view="categories" data-icon="📂"><span>Categories</span></button>
            <button class="nav-item" data-view="products" data-icon="📦"><span>Products</span></button>
            <button class="nav-item" data-view="bills" data-icon="📄"><span>Bills</span></button>
            <button class="nav-item" data-view="pos" data-icon="🛍️"><span>POS</span></button>
            <button class="nav-item" data-view="cart" data-icon="🛒">
                <span>Cart</span>
                <span id="cartCountBadge" class="badge" style="display:none;">0</span>
            </button>
        `;
    } else if (currentUserRole == 3) { // Employee
        menuItems = `
            <button class="nav-item active" data-view="pos" data-icon="🛍️"><span>POS</span></button>
            <button class="nav-item" data-view="cart" data-icon="🛒">
                <span>Cart</span>
                <span id="cartCountBadge_emp" class="badge" style="display:none;">0</span>
            </button>
            <button class="nav-item" data-view="bills" data-icon="📄"><span>Bills</span></button>
        `;
    }

    // Initialize Layout
    appDiv.innerHTML = `
        <div class="dashboard-layout">
            <aside class="sidebar collapsed" id="sidebar">
                <div class="sidebar-header">
                    <div class="logo-area">
                        <img src="${companyLogo}" alt="Logo" id="sidebarLogo">
                        <h2 id="sidebarTitle">${companyName}</h2>
                    </div>
                    <button class="sidebar-toggle" id="sidebarToggle">☰</button>
                </div>
                <nav class="sidebar-nav">
                    ${menuItems}
                </nav>
                <div class="sidebar-footer">
                    <div class="user-info-sm">${currentUser.email}</div>
                    <button id="logoutBtn" class="btn btn-danger btn-sm">
                        <span class="icon-content">⏻</span>
                        <span class="text-content">Logout</span>
                    </button>
                </div>
            </aside>
            
            <main class="main-content">
                <div id="viewContainer">
                    <!-- Dynamic Content -->
                </div>
            </main>

            <!-- Shared Modal Container -->
            <div id="sharedModal" class="modal hidden">
                <div class="modal-content" id="modalContent"></div>
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

    document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget; // Use currentTarget to get the button, not the span
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            target.classList.add('active');
            renderView(target.dataset.view);
        });
    });

    // Initial View
    const initialView = currentUserRole == 2 ? 'company' : 'pos';
    if (initialView !== 'company') {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-item[data-view="${initialView}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }

    // Auto-collapse on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('collapsed');
    }

    renderView(initialView);
}

function renderView(viewName) {
    const container = document.getElementById('viewContainer');
    container.innerHTML = '<div class="loading">Loading...</div>';

    switch (viewName) {
        case 'company': renderCompanyView(container); break;
        case 'categories': renderCategoriesView(container); break;
        case 'products': renderProductsView(container); break;
        case 'bills': renderBillsView(container); break;
        case 'pos': renderPosView(container); break;
        case 'cart': renderCartView(container); break;
    }
}

// ==========================================
// COMPANY VIEW
// ==========================================
async function renderCompanyView(container) {
    if (currentUserRole != 2) {
        container.innerHTML = '<p>Access Denied</p>';
        return;
    }
    try {
        const snapshot = await get(child(ref(db), `COMPANY_DETAILS/${currentCompanyId}`));
        if (snapshot.exists()) {
            const data = snapshot.val();
            const logoUrl = data.LOGO_URL || 'https://via.placeholder.com/100';

            // Update sidebar dynamically just in case
            document.getElementById('sidebarTitle').textContent = data.COMPANY_NAME;
            document.getElementById('sidebarLogo').src = data.LOGO_URL || 'https://via.placeholder.com/40';

            container.innerHTML = `
                <div class="section-header">
                    <h2>Company Details</h2>
                    <button id="editCompanyBtn" class="btn btn-primary">Edit Details</button>
                </div>
                <div class="card">
                    <div style="display:flex; gap:2rem; align-items:start;">
                        <div style="text-align:center;">
                            <img src="${logoUrl}" alt="Company Logo" style="width:100px; height:100px; object-fit:cover; border-radius:12px; border:1px solid #e2e8f0;">
                            <p style="margin-top:0.5rem; color:#6b7280; font-size:0.8rem;">Logo</p>
                        </div>
                        <div class="form-grid" style="flex:1;">
                            <div class="form-group"><label class="form-label">Company Name</label><div class="form-input">${data.COMPANY_NAME}</div></div>
                            <div class="form-group"><label class="form-label">Email</label><div class="form-input">${data.EMAIL}</div></div>
                            <div class="form-group"><label class="form-label">Phone</label><div class="form-input">${data.PHONE_NO || '-'}</div></div>
                            <div class="form-group"><label class="form-label">GST No</label><div class="form-input">${data.GST_NO || '-'}</div></div>
                            <div class="form-group"><label class="form-label">UPI ID</label><div class="form-input">${data.UPI_ID || '-'}</div></div>
                            <div class="form-group"><label class="form-label">GST Flag</label><div class="form-input">${data.GST_FLAG == 1 ? 'Enabled' : 'Disabled'}</div></div>
                            <div class="form-group"><label class="form-label">Address</label><div class="form-input">${data.ADDRESS || '-'}</div></div>
                            <div class="form-group"><label class="form-label">Status</label><div class="form-input">${data.STATUS_SYS_ID == 1 ? 'Active' : 'Inactive'}</div></div>
                            <div class="form-group full-width"><label class="form-label">Notes</label><div class="form-input">${data.NOTES || '-'}</div></div>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('editCompanyBtn').addEventListener('click', () => openCompanyModal());
        } else {
            container.innerHTML = '<p>Company details not found.</p>';
        }
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Error loading company details.</p>';
    }
}

async function openCompanyModal() {
    const modal = document.getElementById('sharedModal');
    const content = document.getElementById('modalContent');
    modal.classList.remove('hidden');

    const snapshot = await get(child(ref(db), `COMPANY_DETAILS/${currentCompanyId}`));
    const data = snapshot.exists() ? snapshot.val() : {};

    content.innerHTML = `
        <h2 id="compModalTitle">Edit Company Details</h2>
        <form id="companyForm">
            <div class="form-grid">
                <div class="form-group full-width">
                    <label class="form-label">Company Logo</label>
                    <input type="file" id="compLogo" class="form-input" accept="image/*">
                    <input type="hidden" id="compLogoUrl" value="${data.LOGO_URL || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Company Name</label>
                    <input type="text" id="compName" class="form-input" value="${data.COMPANY_NAME || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" id="compEmail" class="form-input" value="${data.EMAIL || ''}" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label">Phone</label>
                    <input type="tel" id="compPhone" class="form-input" value="${data.PHONE_NO || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">GST No</label>
                    <input type="text" id="compGst" class="form-input" value="${data.GST_NO || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">UPI ID</label>
                    <input type="text" id="compUpi" class="form-input" value="${data.UPI_ID || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">GST Flag</label>
                    <select id="compGstFlag" class="form-input">
                        <option value="1" ${data.GST_FLAG == 1 ? 'selected' : ''}>Enabled</option>
                        <option value="0" ${data.GST_FLAG == 0 ? 'selected' : ''}>Disabled</option>
                    </select>
                </div>
                <div class="form-group full-width">
                    <label class="form-label">Address</label>
                    <textarea id="compAddress" class="form-input">${data.ADDRESS || ''}</textarea>
                </div>
                <div class="form-group full-width">
                    <label class="form-label">Bill Notes (Footer)</label>
                    <textarea id="compBillNotes" class="form-input">${data.BILL_NOTES || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Bill Series Start No</label>
                    <input type="number" id="compBillSeries" class="form-input" value="${data.BILL_SERIES_START || '1'}">
                </div>
                <div class="form-group full-width">
                    <label class="form-label">Internal Notes</label>
                    <textarea id="compNotes" class="form-input">${data.NOTES || ''}</textarea>
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" id="compCancelBtn" class="btn">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;

    document.getElementById('compCancelBtn').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('companyForm').addEventListener('submit', handleCompanySubmit);
}

async function handleCompanySubmit(e) {
    e.preventDefault();
    const name = document.getElementById('compName').value;
    const phone = document.getElementById('compPhone').value;
    const gst = document.getElementById('compGst').value;
    const upi = document.getElementById('compUpi').value;
    const gstFlag = parseInt(document.getElementById('compGstFlag').value);
    const address = document.getElementById('compAddress').value;
    const billNotes = document.getElementById('compBillNotes').value;
    const billSeries = parseInt(document.getElementById('compBillSeries').value) || 1;
    const notes = document.getElementById('compNotes').value;
    const logoFile = document.getElementById('compLogo').files[0];
    let logoUrl = document.getElementById('compLogoUrl').value;

    const currentUser = auth.currentUser || JSON.parse(localStorage.getItem('userSession'));
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
        if (logoFile) {
            try {
                // Convert to Base64 and compress
                logoUrl = await compressImage(logoFile);
            } catch (uploadError) {
                console.error("Image processing failed:", uploadError);
                alert("Warning: Image processing failed. Saving text details only.");
            }
        }

        await update(ref(db, `COMPANY_DETAILS/${currentCompanyId}`), {
            COMPANY_NAME: name,
            PHONE_NO: phone,
            GST_NO: gst,
            UPI_ID: upi,
            GST_FLAG: gstFlag,
            ADDRESS: address,
            BILL_NOTES: billNotes,
            BILL_SERIES_START: billSeries,
            NOTES: notes,
            LOGO_URL: logoUrl,
            UPDATED_DATE: new Date().toISOString(),
            UPDATED_USER_SYS_ID: currentUser.uid
        });
        document.getElementById('sharedModal').classList.add('hidden');
        renderView('company'); // Refresh view

        // Update sidebar immediately
        document.getElementById('sidebarTitle').textContent = name;
        document.getElementById('sidebarLogo').src = logoUrl;

    } catch (error) {
        console.error("Error updating company:", error);
        alert("Error updating company details");
    } finally {
        submitBtn.textContent = 'Save';
        submitBtn.disabled = false;
    }
}

// ==========================================
// BILLS VIEW
// ==========================================
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

        if (bills.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No bills found for this company.</td></tr>';
            return;
        }

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
                <td>
                    <button class="btn-icon view-btn" title="View PDF">👁️</button>
                    <button class="btn-icon download-btn" title="Download PDF">⬇️</button>
                </td>
            `;

            row.querySelector('.view-btn').addEventListener('click', () => viewBillPdf(bill));
            row.querySelector('.download-btn').addEventListener('click', () => downloadBillPdf(bill, bill.id));

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p>Error loading bills.</p>';
    }
}

// ==========================================
// PDF GENERATION & VIEW
// ==========================================

function getBillHtmlContent(billData) {
    const dateOptions = {
        timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    };
    const billDate = new Date(billData.CREATED_DATE).toLocaleString('en-IN', dateOptions);

    return `
        <style>
            * { box-sizing: border-box; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
        </style>
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
            ${companyData.LOGO_URL ? `<img src="${companyData.LOGO_URL}" style="max-height: 80px; margin-bottom: 10px;">` : ''}
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; text-transform: uppercase;">${companyData.COMPANY_NAME}</h1>
            <p style="margin: 5px 0;">${companyData.ADDRESS || ''}</p>
            <p style="margin: 5px 0;">
                Phone: ${companyData.PHONE_NO || '-'} | Email: ${companyData.EMAIL || '-'}
            </p>
            ${companyData.GST_NO ? `<p style="margin: 5px 0;"><strong>GSTIN:</strong> ${companyData.GST_NO}</p>` : ''}
        </div>

        <hr style="border: 0; border-top: 2px solid #eee; margin: 20px 0;">
        <!-- Bill Meta -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div style="flex: 1;">
                <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase;">Bill To:</h3>
                <p style="margin: 3px 0; font-weight: bold;">${billData.CUSTOMER_NAME}</p>
                <p style="margin: 3px 0;">${billData.CUSTOMER_PHONE}</p>
                <p style="margin: 3px 0; white-space: pre-wrap; max-width: 300px;">${billData.CUSTOMER_ADDRESS || ''}</p>
            </div>
            <div style="flex: 1; text-align: left;">
                <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase;">Invoice Details:</h3>
                <p style="margin: 3px 0;"><strong>Invoice No:</strong> ${billData.BILL_NO}</p>
                <p style="margin: 3px 0;"><strong>Date:</strong> ${billDate}</p>
            </div>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 10pt; table-layout: fixed;">
            <thead>
                <tr style="background-color: #f8f9fa;">
                    <th style="border-bottom: 2px solid #ddd; padding: 5px; text-align: center; width: 5%;">S.No</th>
                    <th style="border-bottom: 2px solid #ddd; padding: 5px; text-align: left; width: ${billData.TOTAL_GST_AMOUNT > 0 ? '30%' : '45%'};">Product Name</th>
                    <th style="border-bottom: 2px solid #ddd; padding: 5px; text-align: left; width: 10%;">HSN</th>
                    <th style="border-bottom: 2px solid #ddd; padding: 5px; text-align: right; width: ${billData.TOTAL_GST_AMOUNT > 0 ? '10%' : '15%'};">Price</th>
                    <th style="border-bottom: 2px solid #ddd; padding: 5px; text-align: center; width: ${billData.TOTAL_GST_AMOUNT > 0 ? '5%' : '10%'};">Qty</th>
                    ${billData.TOTAL_GST_AMOUNT > 0 ? `
                    <th style="border-bottom: 2px solid #ddd; padding: 5px; text-align: right; width: 10%;">GST %</th>
                    <th style="border-bottom: 2px solid #ddd; padding: 5px; text-align: right; width: 15%;">GST Amt</th>
                    ` : ''}
                    <th style="border-bottom: 2px solid #ddd; padding: 5px; text-align: right; width: 15%;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${billData.ITEMS.map((item, index) => `
                    <tr style="page-break-inside: avoid;">
                        <td style="border-bottom: 1px solid #eee; padding: 5px; text-align: center;">${index + 1}</td>
                        <td style="border-bottom: 1px solid #eee; padding: 5px; word-break: break-all;">
                            ${item.NAME}
                            ${item.BRAND ? `<br><span style="font-size: 9pt; color: #666;">${item.BRAND}</span>` : ''}
                        </td>
                        <td style="border-bottom: 1px solid #eee; padding: 5px;">${item.HSN_CODE}</td>
                        <td style="border-bottom: 1px solid #eee; padding: 5px; text-align: right;">₹${item.PRICE}</td>
                        <td style="border-bottom: 1px solid #eee; padding: 5px; text-align: center;">${item.QTY}</td>
                        ${billData.TOTAL_GST_AMOUNT > 0 ? `
                        <td style="border-bottom: 1px solid #eee; padding: 5px; text-align: right;">${item.GST_PERCENTAGE}%</td>
                        <td style="border-bottom: 1px solid #eee; padding: 5px; text-align: right;">₹${item.GST_AMOUNT.toFixed(2)}</td>
                        ` : ''}
                        <td style="border-bottom: 1px solid #eee; padding: 5px; text-align: right;">₹${(item.TOTAL + (item.GST_AMOUNT || 0)).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- Totals -->
        <div style="display: flex; justify-content: flex-end;">
            <div style="width: 100%;">
                <table style="width: 100%; border-collapse: collapse; font-size: 11pt;">
                    <tfoot>
                        <tr style="border-top: 2px solid #000; font-weight: bold; page-break-inside: avoid;">
                            <td colspan="4" style="text-align: right; padding-top: 15px;">
                                Items: ${billData.ITEMS.length} &nbsp;|&nbsp; 
                                Qty: ${billData.ITEMS.reduce((sum, item) => sum + item.QTY, 0)} &nbsp;|&nbsp; 
                                Sub Total: ₹${billData.SUB_TOTAL.toFixed(2)} &nbsp;|&nbsp; 
                                Grand Total: ₹${billData.TOTAL_AMOUNT.toFixed(2)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>

        <!-- Footer Notes -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; page-break-inside: avoid;">
            ${companyData.BILL_NOTES ? `
            <div style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 5px 0; font-size: 12px;">Note:</h4>
                <p style="margin: 0; font-size: 11pt; color: #666; white-space: pre-wrap;">${companyData.BILL_NOTES}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 40px; font-weight: bold;">
                <p>Thank you for your business!</p>
            </div>
        </div>
    `;
}

async function preparePdfContainer(billData) {
    // Create a container that is visible but covered by a white overlay to ensure rendering
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '9999';
    container.style.background = '#fff';
    container.style.overflow = 'auto';

    // Inner content wrapper for PDF capture (A4 width approx)
    const content = document.createElement('div');
    content.style.width = '190mm';
    content.style.margin = '0 auto';
    content.style.background = '#fff';
    content.style.padding = '40px';
    content.style.fontFamily = "'Times New Roman', serif";
    content.style.color = '#333';
    content.style.fontSize = '11pt';

    content.innerHTML = getBillHtmlContent(billData);
    container.appendChild(content);
    document.body.appendChild(container);

    return { container, content };
}

async function downloadBillPdf(billData, billId) {
    const { container, content } = await preparePdfContainer(billData);

    const opt = {
        margin: [10, 10, 20, 10],
        filename: `${billData.BILL_NO}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
    };

    try {
        await html2pdf().set(opt).from(content).toPdf().get('pdf').then(function (pdf) {
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.setTextColor(100);
                pdf.text('Page ' + i + ' of ' + totalPages, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
            }
        }).save();
    } catch (err) {
        console.error("PDF Generation Error:", err);
        alert("Error generating PDF. Please check console.");
    } finally {
        document.body.removeChild(container);
    }
}

async function viewBillPdf(billData) {
    const { container, content } = await preparePdfContainer(billData);

    const opt = {
        margin: [10, 10, 20, 10],
        filename: `${billData.BILL_NO}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
    };

    try {
        const pdfBlobUrl = await html2pdf().set(opt).from(content).toPdf().get('pdf').then(function (pdf) {
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.setTextColor(100);
                pdf.text('Page ' + i + ' of ' + totalPages, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
            }
            return pdf.output('bloburl');
        });

        // Open Modal
        const modal = document.getElementById('sharedModal');
        const modalContent = document.getElementById('modalContent');
        modal.classList.remove('hidden');

        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2>View Bill: ${billData.BILL_NO}</h2>
                <button class="btn" onclick="document.getElementById('sharedModal').classList.add('hidden')">&times; Close</button>
            </div>
            <iframe src="${pdfBlobUrl}" style="width: 100%; height: 80vh; border: none; border-radius: 8px;"></iframe>
        `;

    } catch (err) {
        console.error("PDF View Error:", err);
        alert("Error viewing PDF. Please check console.");
    } finally {
        document.body.removeChild(container);
    }
}

// ==========================================
// CATEGORIES VIEW
// ==========================================
function renderCategoriesView(container) {
    if (currentUserRole != 2) {
        container.innerHTML = '<p>Access Denied</p>';
        return;
    }
    container.innerHTML = `
        <div class="section-header">
            <h2>Categories</h2>
            <button id="addCategoryBtn" class="btn btn-primary">Add Category</button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead><tr><th>Name</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody id="categoriesTableBody"><tr><td colspan="3">Loading...</td></tr></tbody>
            </table>
        </div>
    `;
    document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryModal());
    loadCategories();
}

// ==========================================
// PRODUCTS VIEW
// ==========================================
function renderProductsView(container) {
    if (currentUserRole != 2) {
        container.innerHTML = '<p>Access Denied</p>';
        return;
    }
    container.innerHTML = `
        <div class="section-header">
            <h2>Products</h2>
            <button id="addProductBtn" class="btn btn-primary">Add Product</button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead><tr><th>Image</th><th>Name</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody id="productsTableBody"><tr><td colspan="8">Loading...</td></tr></tbody>
            </table>
        </div>
    `;
    document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
    loadProducts();
}

// ==========================================
// CART VIEW
// ==========================================
function renderCartView(container) {
    container.innerHTML = `
        <div class="section-header"><h2>Your Cart</h2></div>
        <div class="card">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Product</th>
                            <th>HSN</th>
                            <th>Price</th>
                            <th>Qty</th>
                            <th>GST %</th>
                            <th>GST Amt</th>
                            <th>Total</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="mainCartItems">
                        <!-- Cart items will be rendered here by updateCartUI -->
                    </tbody>
                </table>
            </div>
            
            <div class="cart-footer" style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                <div class="customer-details" style="margin-bottom: 1rem; display: grid; gap: 1rem; grid-template-columns: 1fr 1fr;">
                    <input type="text" id="custName" class="form-input" placeholder="Customer Name">
                    <input type="tel" id="custPhone" class="form-input" placeholder="Phone Number">
                    <textarea id="custAddress" class="form-input" placeholder="Address" style="grid-column: span 2; resize: vertical; min-height: 60px;"></textarea>
                </div>
                <div class="total-section" style="margin-bottom: 1rem;">
                    <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Subtotal:</span>
                        <span id="cartSubtotal">0.00</span>
                    </div>
                    <div class="summary-row" id="cartGstRow" style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; display: none;">
                        <span>GST (18%):</span>
                        <span id="cartGst">0.00</span>
                    </div>
                    <div class="total-row" style="display: flex; justify-content: space-between; font-size: 1.5rem; font-weight: bold; border-top: 1px solid var(--border-color); padding-top: 0.5rem;">
                        <span>Total:</span>
                        <span id="cartTotal">0.00</span>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem;">
                     <button class="btn" onclick="renderView('pos')">Back to POS</button>
                     <button id="printBtn" class="btn btn-primary" style="flex: 1;" disabled>Generate Bill & Print</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('printBtn').addEventListener('click', generateBill);
    updateCartUI();
}

// ==========================================
// POS VIEW
// ==========================================
async function renderPosView(container) {
    // Inject POS specific CSS if needed
    if (!document.getElementById('pos-styles')) {
        const style = document.createElement('style');
        style.id = 'pos-styles';
        style.textContent = `
            .billing-container { display: flex; gap: 2rem; height: calc(100vh - 100px); position: relative; font-family: 'Inter', sans-serif; }
            .products-panel { flex: 2; display: flex; flex-direction: column; overflow: hidden; transition: all 0.3s; padding-right: 5px; }
            
            .cart-panel { flex: 1; background: white; border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); transition: all 0.3s; position: relative; min-width: 320px; border: 1px solid #f1f5f9; }
            .cart-panel.collapsed { flex: 0; min-width: 60px; width: 60px; padding: 1rem 0.5rem; overflow: hidden; align-items: center; }
            .cart-panel.collapsed > *:not(.toggle-cart-btn) { display: none; }
            .toggle-cart-btn { position: absolute; top: 15px; right: 15px; z-index: 10; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 50%; width: 32px; height: 32px; font-size: 1.2rem; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
            .toggle-cart-btn:hover { background: #e2e8f0; color: #1e293b; }
            .cart-panel.collapsed .toggle-cart-btn { right: 50%; transform: translateX(50%); top: 20px; }
            
            .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; overflow-y: auto; padding: 0.5rem; padding-bottom: 2rem; }
            
            /* Stylish Product Card */
            .product-card { 
                background: white; 
                border-radius: 12px; 
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); 
                transition: all 0.3s ease; 
                border: 1px solid #f1f5f9; 
                overflow: hidden; 
                display: flex; 
                flex-direction: column; 
                position: relative;
                min-height: 300px; /* Reduced height */
            }
            .product-card:hover { 
                transform: translateY(-4px); 
                box-shadow: 0 15px 20px -5px rgba(0, 0, 0, 0.1), 0 8px 8px -6px rgba(0, 0, 0, 0.1); 
                border-color: #6366f1; 
            }
            
            .card-image-wrapper {
                width: 100%;
                height: 140px; /* Reduced image height */
                min-height: 140px;
                background: #f8fafc;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            .card-image-wrapper img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.5s ease;
            }
            .product-card:hover .card-image-wrapper img {
                transform: scale(1.05);
            }
            
            .card-content {
                padding: 1rem;
                display: flex;
                flex-direction: column;
                flex-grow: 1;
                gap: 0.5rem;
            }
            
            .product-card h3 { 
                margin: 0; 
                font-size: 1rem; 
                font-weight: 600; 
                color: #1e293b; 
                line-height: 1.3;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            .product-brand {
                font-size: 0.75rem; 
                color: #64748b; 
                text-transform: uppercase; 
                letter-spacing: 0.05em; 
                font-weight: 600;
            }
            
            .price-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: auto;
                padding-top: 0.25rem;
            }
            
            .product-card .price { 
                font-weight: 700; 
                color: #0f172a; 
                font-size: 1.1rem; 
            }
            
            .product-card .stock { 
                font-size: 0.7rem; 
                padding: 2px 6px; 
                border-radius: 999px; 
                background: #ecfdf5; 
                color: #059669; 
                font-weight: 600; 
            }
            .product-card .stock.low-stock {
                background: #fffbeb;
                color: #d97706;
            }
            .product-card .stock.out-stock {
                 background: #fef2f2;
                 color: #dc2626;
            }

            .add-to-cart-btn {
                width: 100%;
                padding: 0.6rem;
                background: #4f46e5;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                margin-top: 0.5rem;
            }
            .add-to-cart-btn:hover {
                background: #4338ca;
            }
            .add-to-cart-btn:active {
                transform: scale(0.98);
            }
            
            @keyframes addToCartAnim {
                0% { transform: scale(1); }
                50% { transform: scale(0.9); background: #10b981; }
                100% { transform: scale(1); background: #4f46e5; }
            }
            .animate-added {
                animation: addToCartAnim 0.6s ease;
            }

            /* Badge Styles */
            .badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background-color: #ef4444;
                color: white;
                border-radius: 50%;
                padding: 2px 6px;
                font-size: 0.7rem;
                font-weight: bold;
                min-width: 18px;
                text-align: center;
                border: 2px solid white;
            }
            .nav-item { position: relative; } /* Ensure relative pos for badge */

            .cart-items { flex: 1; overflow-y: auto; margin: 1rem 0; border-top: 1px dashed #e2e8f0; border-bottom: 1px dashed #e2e8f0; padding: 1rem 0; }
            .cart-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; }
            .cart-item:last-child { margin-bottom: 0; border-bottom: none; }
            
            .item-info { flex: 1; }
            .item-name { font-weight: 600; font-size: 0.9rem; color: #334155; margin-bottom: 0.25rem; }
            .item-price { font-size: 0.8rem; color: #64748b; }
            
            .item-actions { display: flex; align-items: center; gap: 0.5rem; background: #f8fafc; padding: 4px; border-radius: 8px; }
            .btn-qty { width: 24px; height: 24px; border-radius: 6px; border: none; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05); color: #334155; font-weight: bold; }
            .btn-qty:hover { background: #e2e8f0; }
            .btn-remove { color: #fee2e2; background: #ef4444; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; font-size: 1rem; margin-left: auto; transition: all 0.2s;}
            .btn-remove:hover { background: #dc2626; color: white; transform: rotate(90deg); }
            
            .total-row { display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 800; margin-bottom: 1rem; color: #0f172a; }
            .customer-details { display: grid; gap: 0.75rem; margin-bottom: 1.5rem; background: #f8fafc; padding: 1rem; border-radius: 12px; }
            .filter-bar { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; }
            .form-input { border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.6rem 1rem; outline: none; transition: border-color 0.2s; width: 100%; font-size: 0.9rem; }
            .form-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
            
            @media (max-width: 1024px) { .billing-container { flex-direction: column; height: auto; } .products-panel { height: auto; min-height: 500px; } .cart-panel { min-width: auto; } }
        `;
        document.head.appendChild(style);
    }

    // Fetch categories for filter
    const catSnap = await get(child(ref(db), `CATEGORY_DETAILS/${currentCompanyId}`));
    let catOptions = '<option value="">All Categories</option>';
    if (catSnap.exists()) {
        const cats = catSnap.val();
        Object.keys(cats).forEach(key => {
            if (cats[key].STATUS_SYS_ID == 1) catOptions += `<option value="${key}">${cats[key].CATEGORY_NAME}</option>`;
        });
    }

    container.innerHTML = `
        <div class="billing-container">
            <div class="products-panel">
                <div class="filter-bar">
                    <input type="text" id="posSearchName" class="form-input" placeholder="Search Product...">
                    <input type="text" id="posSearchBrand" class="form-input" placeholder="Search Brand...">
                    <select id="posSearchCat" class="form-input">${catOptions}</select>
                </div>
                <div id="productsGrid" class="products-grid">
                    <div class="loading">Loading products...</div>
                </div>
            </div>
            
            <div class="cart-panel" id="posCartPanel">
                <button class="toggle-cart-btn" id="toggleCartBtn" title="Toggle Cart">⇥</button>
                <h2 style="margin-top:0;">Current Bill</h2>
                <div class="customer-details">
                    <input type="text" id="custName" class="form-input" placeholder="Customer Name">
                    <input type="tel" id="custPhone" class="form-input" placeholder="Phone Number">
                    <textarea id="custAddress" class="form-input" placeholder="Address" style="resize: vertical; min-height: 60px;"></textarea>
                </div>
                
                <div class="cart-items" id="posCartItems">
                    <!-- Cart items here -->
                    <div class="empty-cart" style="text-align:center; color:#9ca3af; margin-top:2rem;">Cart is empty</div>
                </div>
                
                <div class="cart-footer">
                    <div class="total-section">
                        <div class="summary-row" style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                            <span>Subtotal:</span>
                            <span id="posCartSubtotal">0.00</span>
                        </div>
                        <div class="summary-row" id="posCartGstRow" style="display: flex; justify-content: space-between; font-size: 0.9rem; display: none;">
                            <span>GST (18%):</span>
                            <span id="posCartGst">0.00</span>
                        </div>
                        <div class="total-row" style="display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: bold; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.5rem;">
                            <span>Total:</span>
                            <span id="posCartTotal">0.00</span>
                        </div>
                    </div>
                    <button id="printBtn" class="btn btn-primary" style="width:100%;" disabled>Generate Bill & Print</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('posSearchName').addEventListener('input', filterPosProducts);
    document.getElementById('posSearchBrand').addEventListener('input', filterPosProducts);
    document.getElementById('posSearchCat').addEventListener('change', filterPosProducts);
    document.getElementById('printBtn').addEventListener('click', generateBill);
    document.getElementById('toggleCartBtn').addEventListener('click', () => {
        const panel = document.getElementById('posCartPanel');
        panel.classList.toggle('collapsed');
        document.getElementById('toggleCartBtn').textContent = panel.classList.contains('collapsed') ? '⇤' : '⇥';
    });

    // Restore cart state if switching back
    updateCartUI();
    loadProductsForPos();
}

// --- POS Logic ---

async function loadProductsForPos() {
    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `PRODUCT_DETAILS/${currentCompanyId}`));

        posProducts = [];

        if (snapshot.exists()) {
            const allProducts = snapshot.val();
            Object.keys(allProducts).forEach(key => {
                const prod = allProducts[key];
                if (prod.STATUS_SYS_ID == 1) { // Active only
                    posProducts.push({ id: key, ...prod });
                }
            });
        }

        renderPosProducts(posProducts);

    } catch (error) {
        console.error("Error loading products:", error);
        document.getElementById('productsGrid').innerHTML = '<div class="error">Error loading products</div>';
    }
}

function renderPosProducts(prods) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (prods.length === 0) {
        grid.innerHTML = '<div class="no-results">No products found</div>';
        return;
    }

    prods.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const imgHtml = prod.IMAGE_URL ? `<img src="${prod.IMAGE_URL}" alt="Prod" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem;">` : '';
        const brandHtml = prod.BRAND ? `<div style="font-size:0.75rem; color:#9ca3af;">${prod.BRAND}</div>` : '';

        card.innerHTML = `
            <div class="card-image-wrapper">
                ${imgHtml}
            </div>
            <div class="card-content">
                <h3>${prod.PRODUCT_NAME}</h3>
                ${brandHtml ? `<div class="product-brand">${prod.BRAND}</div>` : ''}
                <div class="price-row">
                    <div class="price">₹${prod.PRICE}</div>
                    <div class="stock ${prod.STOCK_COUNT < 5 ? 'low-stock' : ''} ${prod.STOCK_COUNT === 0 ? 'out-stock' : ''}">
                        ${prod.STOCK_COUNT > 0 ? 'Stock: ' + prod.STOCK_COUNT : 'Out of Stock'}
                    </div>
                </div>
                <button class="add-to-cart-btn" data-id="${prod.id}" ${prod.STOCK_COUNT <= 0 ? 'disabled style="background:#ccc; cursor:not-allowed;"' : ''}>
                    ${prod.STOCK_COUNT > 0 ? 'Add to Cart' : 'Sold Out'}
                </button>
            </div>
        `;
        // card.addEventListener('click', () => addToCart(prod));
        // Only trigger on button click now
        const btn = card.querySelector('.add-to-cart-btn');
        if (btn && prod.STOCK_COUNT > 0) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(prod, btn);
            });
        }
        grid.appendChild(card);
    });
}

function filterPosProducts() {
    const nameTerm = document.getElementById('posSearchName').value.toLowerCase();
    const brandTerm = document.getElementById('posSearchBrand').value.toLowerCase();
    const catTerm = document.getElementById('posSearchCat').value;

    const filtered = posProducts.filter(p => {
        const matchName = p.PRODUCT_NAME.toLowerCase().includes(nameTerm);
        const matchBrand = (p.BRAND || '').toLowerCase().includes(brandTerm);
        const matchCat = catTerm === '' || p.CATEGORY_SYS_ID === catTerm;
        return matchName && matchBrand && matchCat;
    });
    renderPosProducts(filtered);
}

function addToCart(product, btnElement = null) {
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

    // Animation
    if (btnElement) {
        btnElement.classList.add('animate-added');
        const originalText = btnElement.innerText;
        btnElement.innerText = 'Added!';
        setTimeout(() => {
            btnElement.classList.remove('animate-added');
            btnElement.innerText = originalText;
        }, 1000); // 1s matches animation/timeout
    }
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
    const totalEl = document.getElementById('cartTotal');
    const printBtn = document.getElementById('printBtn');

    // Update Badge
    const badge = document.getElementById('cartCountBadge') || document.getElementById('cartCountBadge_emp');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'inline-block' : 'none';

        // Also update the sidebar explicitly if needed?
        // The above selector should catch it.
        // Update all badges found (if switching views/roles)
        document.querySelectorAll('.badge').forEach(b => {
            b.textContent = totalItems;
            b.style.display = totalItems > 0 ? 'inline-block' : 'none';
        });
    }

    // Update Main Cart (Table)
    const mainContainer = document.getElementById('mainCartItems');
    if (mainContainer) {
        mainContainer.innerHTML = '';
        if (cart.length === 0) {
            mainContainer.innerHTML = '<tr><td colspan="8" style="text-align:center;">Cart is empty</td></tr>';
        } else {
            cart.forEach((item, index) => {
                const itemTotal = item.PRICE * item.qty;
                const gstPercent = parseFloat(item.GST_PERCENTAGE) || 0;
                const itemGst = (itemTotal * gstPercent) / 100;
                const rowTotal = itemTotal + itemGst;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${item.PRODUCT_NAME}</td>
                    <td>${item.HSN_CODE || '-'}</td>
                    <td>₹${item.PRICE}</td>
                    <td>
                        <div class="item-actions" style="justify-content:center;">
                            <button class="btn-qty minus">-</button>
                            <span>${item.qty}</span>
                            <button class="btn-qty plus">+</button>
                        </div>
                    </td>
                    <td>${gstPercent}%</td>
                    <td>₹${itemGst.toFixed(2)}</td>
                    <td>₹${rowTotal.toFixed(2)}</td>
                    <td><button class="btn-remove" style="color:red;">&times;</button></td>
        `;
                tr.querySelector('.minus').addEventListener('click', () => updateQty(item.id, -1));
                tr.querySelector('.plus').addEventListener('click', () => updateQty(item.id, 1));
                tr.querySelector('.btn-remove').addEventListener('click', () => removeFromCart(item.id));
                mainContainer.appendChild(tr);
            });
        }
    }

    // Update POS Cart (List)
    const posContainer = document.getElementById('posCartItems');
    if (posContainer) {
        posContainer.innerHTML = '';
        if (cart.length === 0) {
            posContainer.innerHTML = '<div class="empty-cart" style="text-align:center; color:#9ca3af; margin-top:2rem;">Cart is empty</div>';
        } else {
            cart.forEach(item => {
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
                posContainer.appendChild(row);
            });
        }
    }

    // Calculate Totals
    let subTotal = 0;
    let totalGst = 0;
    const gstEnabled = companyData.GST_FLAG == 1;

    cart.forEach(item => {
        const itemTotal = item.PRICE * item.qty;
        subTotal += itemTotal;
        if (gstEnabled) {
            const gstPercent = parseFloat(item.GST_PERCENTAGE) || 0;
            totalGst += (itemTotal * gstPercent) / 100;
        }
    });

    const grandTotal = subTotal + totalGst;

    // Update Main Cart UI
    if (totalEl) totalEl.textContent = grandTotal.toFixed(2);
    const subTotalEl = document.getElementById('cartSubtotal');
    const gstRowEl = document.getElementById('cartGstRow');
    const gstEl = document.getElementById('cartGst');

    if (subTotalEl) subTotalEl.textContent = subTotal.toFixed(2);
    if (gstRowEl) {
        gstRowEl.style.display = 'none'; // Hide Total GST Row
    }
    if (gstEl) gstEl.textContent = totalGst.toFixed(2);

    // Update POS Cart UI (if exists)
    const posTotalEl = document.getElementById('posCartTotal');
    const posSubTotalEl = document.getElementById('posCartSubtotal');
    const posGstRowEl = document.getElementById('posCartGstRow');
    const posGstEl = document.getElementById('posCartGst');

    if (posTotalEl) posTotalEl.textContent = grandTotal.toFixed(2);
    if (posSubTotalEl) posSubTotalEl.textContent = subTotal.toFixed(2);
    if (posGstRowEl) {
        posGstRowEl.style.display = 'none'; // Hide Total GST Row
    }
    if (posGstEl) posGstEl.textContent = totalGst.toFixed(2);

    if (printBtn) printBtn.disabled = false;
}

async function generateBill() {
    const custName = document.getElementById('custName').value;
    const custPhone = document.getElementById('custPhone').value;
    const custAddress = document.getElementById('custAddress').value;

    if (!custName) {
        alert("Please enter customer name");
        return;
    }

    const subTotal = cart.reduce((sum, item) => sum + (item.PRICE * item.qty), 0);
    const gstEnabled = companyData.GST_FLAG == 1;
    let totalGst = 0;

    const items = cart.map(i => {
        const itemTotal = i.PRICE * i.qty;
        const gstPercent = parseFloat(i.GST_PERCENTAGE) || 0;
        const itemGst = gstEnabled ? ((itemTotal * gstPercent) / 100) : 0;
        totalGst += itemGst;
        return {
            PRODUCT_ID: i.id,
            NAME: i.PRODUCT_NAME,
            BRAND: i.BRAND || '',
            HSN_CODE: i.HSN_CODE || '-',
            QTY: i.qty,
            PRICE: i.PRICE,
            GST_PERCENTAGE: gstEnabled ? gstPercent : 0,
            GST_AMOUNT: itemGst,
            TOTAL: itemTotal
        };
    });

    const grandTotal = subTotal + totalGst;

    const billData = {
        CUSTOMER_NAME: custName,
        CUSTOMER_PHONE: custPhone,
        CUSTOMER_ADDRESS: custAddress,
        ITEMS: items,
        SUB_TOTAL: subTotal,
        TOTAL_GST_AMOUNT: totalGst,
        TOTAL_AMOUNT: grandTotal,
        CREATED_BY: (auth.currentUser || JSON.parse(localStorage.getItem('userSession'))).uid,
        CREATED_DATE: new Date().toISOString(),
        STATUS_SYS_ID: 1
    };


    // Check for UPI ID and show QR Code
    if (companyData.UPI_ID) {
        showQrModal(billData);
    } else {
        saveAndPrintBill(billData);
    }
}

function showQrModal(billData) {
    const modal = document.getElementById('sharedModal');
    const content = document.getElementById('modalContent');
    modal.classList.remove('hidden');

    const qrData = `upi://pay?pa=${companyData.UPI_ID}&pn=${encodeURIComponent(companyData.COMPANY_NAME)}&am=${billData.TOTAL_AMOUNT.toFixed(2)}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;

    content.innerHTML = `
        <div style="text-align: center; padding: 1rem;">
            <h2>Scan to Pay</h2>
            <p style="margin-bottom: 1rem; color: #666;">Total Amount: <strong style="font-size: 1.2rem; color: #000;">₹${billData.TOTAL_AMOUNT.toFixed(2)}</strong></p>
            <div style="background: white; padding: 1rem; display: inline-block; border-radius: 8px; border: 1px solid #eee; margin-bottom: 1.5rem;">
                <img src="${qrUrl}" alt="Payment QR Code" style="width: 250px; height: 250px;">
            </div>
            <p style="margin-bottom: 1.5rem; font-size: 0.9rem;">UPI ID: ${companyData.UPI_ID}</p>
            <div class="modal-actions" style="justify-content: center; gap: 1rem;">
                <button id="cancelBillBtn" class="btn">Cancel</button>
                <button id="confirmPrintBtn" class="btn btn-primary">Payment Received & Print Bill</button>
            </div>
        </div>
    `;

    document.getElementById('cancelBillBtn').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('confirmPrintBtn').addEventListener('click', () => {
        modal.classList.add('hidden');
        saveAndPrintBill(billData);
    });
}

async function saveAndPrintBill(billData) {
    try {
        // Generate Bill No with Series
        const seriesStart = parseInt(companyData.BILL_SERIES_START) || 1;
        const now = new Date();
        const dateStr = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0') +
            now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0') +
            now.getSeconds().toString().padStart(2, '0');

        const billNo = `BILL_${dateStr}_${seriesStart}`;

        const newBillRef = push(ref(db, `BILL_DETAILS/${currentCompanyId}`));
        billData.SYS_ID = newBillRef.key;
        billData.BILL_NO = billNo;
        billData.BILL_SERIES_NO = seriesStart;

        await set(newBillRef, billData);

        // Increment Series No
        await update(ref(db, `COMPANY_DETAILS/${currentCompanyId}`), {
            BILL_SERIES_START: seriesStart + 1
        });
        // Update local companyData to reflect increment immediately
        companyData.BILL_SERIES_START = seriesStart + 1;

        logAction("CREATE", "BILL_DETAILS", newBillRef.key, billData);

        // Update stock
        for (const item of cart) {
            const newStock = item.STOCK_COUNT - item.qty;
            await update(ref(db, `PRODUCT_DETAILS/${currentCompanyId}/${item.id}`), {
                STOCK_COUNT: newStock,
                UPDATED_DATE: new Date().toISOString()
            });
        }

        // Print/Download PDF
        await downloadBillPdf(billData, newBillRef.key);

        // Reset
        cart = [];
        updateCartUI();
        document.getElementById('custName').value = '';
        document.getElementById('custPhone').value = '';
        document.getElementById('custAddress').value = '';
        loadProductsForPos(); // Refresh stock

    } catch (error) {
        console.error("Error generating bill:", error);
        alert("Error generating bill");
    }
}



// --- Category Logic ---

async function loadProducts() {
    if (!currentCompanyId) return;
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';

    try {
        const snapshot = await get(child(ref(db), `PRODUCT_DETAILS/${currentCompanyId}`));
        tbody.innerHTML = '';

        if (!snapshot.exists()) {
            tbody.innerHTML = '<tr><td colspan="8">No products found.</td></tr>';
            return;
        }

        const products = snapshot.val();
        // Fetch categories to map ID to Name
        const catSnap = await get(child(ref(db), `CATEGORY_DETAILS/${currentCompanyId}`));
        const categories = catSnap.exists() ? catSnap.val() : {};

        Object.keys(products).forEach(key => {
            const p = products[key];
            const catName = categories[p.CATEGORY_SYS_ID] ? categories[p.CATEGORY_SYS_ID].CATEGORY_NAME : 'Unknown';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${p.IMAGE_URL || 'https://via.placeholder.com/50'}" alt="Product" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                <td>${p.PRODUCT_NAME}</td>
                <td>${p.BRAND || '-'}</td>
                <td>${catName}</td>
                <td>₹${p.PRICE}</td>
                <td>${p.STOCK_COUNT}</td>
                <td><span class="status-badge ${p.STATUS_SYS_ID == 1 ? 'status-active' : 'status-inactive'}">${p.STATUS_SYS_ID == 1 ? 'Active' : 'Inactive'}</span></td>
                <td>
                    <button class="btn-icon edit-prod-btn" data-id="${key}">Edit</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        document.querySelectorAll('.edit-prod-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openEditProductModal(e.target.dataset.id));
        });

    } catch (error) {
        console.error("Error loading products:", error);
        tbody.innerHTML = '<tr><td colspan="8">Error loading products.</td></tr>';
    }
}

async function loadCategories() {
    if (!currentCompanyId) return;
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';

    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, `CATEGORY_DETAILS/${currentCompanyId}`));

        tbody.innerHTML = '';

        if (!snapshot.exists()) {
            tbody.innerHTML = '<tr><td colspan="3">No categories found.</td></tr>';
            return;
        }

        const categories = snapshot.val();
        Object.keys(categories).forEach((key) => {
            const data = categories[key];
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${data.CATEGORY_NAME}</td>
                <td>${data.STATUS_SYS_ID == 1 ? 'Active' : 'Inactive'}</td>
                <td>
                    <button class="btn-icon edit-cat-btn" data-id="${key}">Edit</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        document.querySelectorAll('.edit-cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openEditCategoryModal(e.target.dataset.id));
        });

    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

function openCategoryModal(id = null) {
    const modal = document.getElementById('sharedModal');
    const content = document.getElementById('modalContent');
    modal.classList.remove('hidden');

    content.innerHTML = `
        <h2 id="catModalTitle">${id ? 'Edit' : 'Add'} Category</h2>
        <form id="categoryForm">
            <input type="hidden" id="catId" value="${id || ''}">
            <div class="form-group">
                <label class="form-label">Category Name</label>
                <input type="text" id="catName" class="form-input" required>
            </div>
            <div class="form-group">
                <label class="form-label">Status</label>
                <select id="catStatus" class="form-input">
                    <option value="1">Active</option>
                    <option value="2">Inactive</option>
                </select>
            </div>
            <div class="modal-actions">
                <button type="button" id="catCancelBtn" class="btn">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;

    document.getElementById('catCancelBtn').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);

    if (id) {
        // Fetch data if editing
        get(child(ref(db), `CATEGORY_DETAILS/${currentCompanyId}/${id}`)).then(snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                document.getElementById('catName').value = data.CATEGORY_NAME;
                document.getElementById('catStatus').value = data.STATUS_SYS_ID;
            }
        });
    }
}

async function openEditCategoryModal(id) {
    openCategoryModal(id);
}

async function openProductModal(id = null) {
    const modal = document.getElementById('sharedModal');
    const content = document.getElementById('modalContent');
    modal.classList.remove('hidden');

    // Fetch categories for dropdown
    const catSnap = await get(child(ref(db), `CATEGORY_DETAILS/${currentCompanyId}`));
    let catOptions = '<option value="">Select Category</option>';
    if (catSnap.exists()) {
        const cats = catSnap.val();
        Object.keys(cats).forEach(key => {
            if (cats[key].STATUS_SYS_ID == 1) catOptions += `<option value="${key}">${cats[key].CATEGORY_NAME}</option>`;
        });
    }

    content.innerHTML = `
        <h2 id="prodModalTitle">${id ? 'Edit' : 'Add'} Product</h2>
        <form id="productForm">
            <input type="hidden" id="prodId" value="${id || ''}">
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Product Name</label>
                    <input type="text" id="prodName" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Brand</label>
                    <input type="text" id="prodBrand" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <select id="prodCategory" class="form-input" required>${catOptions}</select>
                </div>
                <div class="form-group">
                    <label class="form-label">Price</label>
                    <input type="number" id="prodPrice" class="form-input" step="0.01" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Stock Count</label>
                    <input type="number" id="prodStock" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="form-label">GST Percentage</label>
                    <input type="number" id="prodGst" class="form-input" step="0.01">
                </div>
                <div class="form-group">
                    <label class="form-label">HSN Code</label>
                    <input type="text" id="prodHsn" class="form-input">
                </div>
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select id="prodStatus" class="form-input">
                        <option value="1">Active</option>
                        <option value="2">Inactive</option>
                    </select>
                </div>
                <div class="form-group full-width">
                    <label class="form-label">Product Image</label>
                    <input type="file" id="prodImage" class="form-input" accept="image/*">
                    <input type="hidden" id="prodImageUrl">
                </div>
                <div class="form-group full-width">
                    <label class="form-label">Description</label>
                    <textarea id="prodDesc" class="form-input"></textarea>
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" id="prodCancelBtn" class="btn">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;

    document.getElementById('prodCancelBtn').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);

    if (id) {
        get(child(ref(db), `PRODUCT_DETAILS/${currentCompanyId}/${id}`)).then(snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                document.getElementById('prodName').value = data.PRODUCT_NAME;
                document.getElementById('prodBrand').value = data.BRAND || '';
                document.getElementById('prodDesc').value = data.DESCRIPTION || '';
                document.getElementById('prodCategory').value = data.CATEGORY_SYS_ID;
                document.getElementById('prodPrice').value = data.PRICE;
                document.getElementById('prodStock').value = data.STOCK_COUNT;
                document.getElementById('prodGst').value = data.GST_PERCENTAGE || '';
                document.getElementById('prodHsn').value = data.HSN_CODE || '';
                document.getElementById('prodStatus').value = data.STATUS_SYS_ID;
                document.getElementById('prodImageUrl').value = data.IMAGE_URL || '';
            }
        });
    }
}

async function openEditProductModal(id) {
    openProductModal(id);
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    const id = document.getElementById('catId').value;
    const name = document.getElementById('catName').value;
    const status = parseInt(document.getElementById('catStatus').value);

    const currentUser = auth.currentUser || JSON.parse(localStorage.getItem('userSession'));
    const data = {
        CATEGORY_NAME: name,
        STATUS_SYS_ID: status,
        UPDATED_DATE: new Date().toISOString(),
        UPDATED_USER_SYS_ID: currentUser.uid
    };

    try {
        if (id) {
            await update(ref(db, `CATEGORY_DETAILS/${currentCompanyId}/${id}`), data);
            logAction("UPDATE", "CATEGORY_DETAILS", id, data);
        } else {
            data.CREATED_DATE = new Date().toISOString();
            data.VERSION_NO = 1;
            const newRef = push(ref(db, `CATEGORY_DETAILS/${currentCompanyId}`));
            data.SYS_ID = newRef.key;
            await set(newRef, data);
            logAction("CREATE", "CATEGORY_DETAILS", newRef.key, data);
        }
        document.getElementById('sharedModal').classList.add('hidden');
        loadCategories();
    } catch (error) {
        console.error("Error saving category:", error);
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    const name = document.getElementById('prodName').value;
    const brand = document.getElementById('prodBrand').value;
    const desc = document.getElementById('prodDesc').value;
    const category = document.getElementById('prodCategory').value;
    const price = parseFloat(document.getElementById('prodPrice').value);
    const stock = parseInt(document.getElementById('prodStock').value);
    const gst = parseFloat(document.getElementById('prodGst').value) || 0;
    const hsn = document.getElementById('prodHsn').value;
    const status = parseInt(document.getElementById('prodStatus').value);
    const imageFile = document.getElementById('prodImage').files[0];
    let imageUrl = document.getElementById('prodImageUrl').value;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
        if (imageFile) {
            try {
                // Convert to Base64 and compress
                imageUrl = await compressImage(imageFile);
            } catch (uploadError) {
                console.error("Product image processing failed:", uploadError);
                alert("Warning: Image processing failed. Saving text details only.");
            }
        }

        const currentUser = auth.currentUser || JSON.parse(localStorage.getItem('userSession'));
        const data = {
            PRODUCT_NAME: name,
            BRAND: brand,
            DESCRIPTION: desc,
            CATEGORY_SYS_ID: category,
            PRICE: price,
            STOCK_COUNT: stock,
            GST_PERCENTAGE: gst,
            HSN_CODE: hsn,
            IMAGE_URL: imageUrl,
            STATUS_SYS_ID: status,
            UPDATED_DATE: new Date().toISOString(),
            UPDATED_USER_SYS_ID: currentUser.uid
        };

        if (id) {
            await update(ref(db, `PRODUCT_DETAILS/${currentCompanyId}/${id}`), data);
            logAction("UPDATE", "PRODUCT_DETAILS", id, data);
        } else {
            data.CREATED_DATE = new Date().toISOString();
            data.VERSION_NO = 1;
            const newRef = push(ref(db, `PRODUCT_DETAILS/${currentCompanyId}`));
            data.SYS_ID = newRef.key;
            await set(newRef, data);
            logAction("CREATE", "PRODUCT_DETAILS", newRef.key, data);
        }
        document.getElementById('sharedModal').classList.add('hidden');
        loadProducts();
    } catch (error) {
        console.error("Error saving product:", error);
        alert("Error saving product");
    } finally {
        submitBtn.textContent = 'Save';
        submitBtn.disabled = false;
    }
}

function closeModal(modalId) {
    // Deprecated, using sharedModal
    document.getElementById(modalId).classList.add('hidden');
}

// Helper to compress image to Base64
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Compress to JPEG with 0.7 quality
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}
