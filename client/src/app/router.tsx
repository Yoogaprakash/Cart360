import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { AppLayout } from "../layouts/AppLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { VerifyEmailPage } from "../features/auth/pages/VerifyEmailPage";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { ProductsListPage } from "../features/products/pages/ProductsListPage";
import { ProductFormPage } from "../features/products/pages/ProductFormPage";
import { UnitsPage } from "../features/units/pages/UnitsPage";
import { CategoriesPage } from "../features/categories/pages/CategoriesPage";
import { BrandsPage } from "../features/brands/pages/BrandsPage";
import { WarehousesPage } from "../features/warehouses/pages/WarehousesPage";
import { CompaniesPage } from "../features/superadmin/pages/CompaniesPage";
import { SuperAdminDashboardPage } from "../features/superadmin/pages/SuperAdminDashboardPage";
import { SubscriptionPlansPage } from "../features/superadmin/pages/SubscriptionPlansPage";
import { CustomersListPage } from "../features/customers/pages/CustomersListPage";
import { CustomerFormPage } from "../features/customers/pages/CustomerFormPage";
import { SuppliersListPage } from "../features/suppliers/pages/SuppliersListPage";
import { SupplierFormPage } from "../features/suppliers/pages/SupplierFormPage";
import { InvoicesListPage } from "../features/invoices/pages/InvoicesListPage";
import { InvoiceFormPage } from "../features/invoices/pages/InvoiceFormPage";
import { InvoiceDetailPage } from "../features/invoices/pages/InvoiceDetailPage";
import { QuotationsListPage } from "../features/quotations/pages/QuotationsListPage";
import { QuotationFormPage } from "../features/quotations/pages/QuotationFormPage";
import { QuotationDetailPage } from "../features/quotations/pages/QuotationDetailPage";
import { PurchasesListPage } from "../features/purchases/pages/PurchasesListPage";
import { PurchaseFormPage } from "../features/purchases/pages/PurchaseFormPage";
import { PurchaseDetailPage } from "../features/purchases/pages/PurchaseDetailPage";
import { SalesReturnsListPage } from "../features/returns/pages/SalesReturnsListPage";
import { SalesReturnFormPage } from "../features/returns/pages/SalesReturnFormPage";
import { PurchaseReturnsListPage } from "../features/returns/pages/PurchaseReturnsListPage";
import { PurchaseReturnFormPage } from "../features/returns/pages/PurchaseReturnFormPage";
import { ExpensesPage } from "../features/expenses/pages/ExpensesPage";
import { IncomePage } from "../features/income/pages/IncomePage";
import { InventoryPage } from "../features/stockAdjustments/pages/InventoryPage";
import { ReportsPage } from "../features/reports/pages/ReportsPage";
import { UsersPage } from "../features/users/pages/UsersPage";
import { CompanySettingsPage } from "../features/company/pages/CompanySettingsPage";

// BASE_URL reflects Vite's `base` config (e.g. "/cart360/" in the GitHub Pages
// build, "/" in dev) so client-side routes resolve correctly under the repo subpath.
export const router = createBrowserRouter([
  { index: true, element: <Navigate to="/login" replace /> },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> }
    ]
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute allowedRoles={["CompanyAdmin", "Employee", "CompanyUser"]}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "products", element: <ProductsListPage /> },
      { path: "products/new", element: <ProductFormPage /> },
      { path: "products/:id/edit", element: <ProductFormPage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "brands", element: <BrandsPage /> },
      { path: "units", element: <UnitsPage /> },
      { path: "warehouses", element: <WarehousesPage /> },
      { path: "invoices", element: <InvoicesListPage /> },
      { path: "invoices/new", element: <InvoiceFormPage /> },
      { path: "invoices/:id", element: <InvoiceDetailPage /> },
      { path: "quotations", element: <QuotationsListPage /> },
      { path: "quotations/new", element: <QuotationFormPage /> },
      { path: "quotations/:id", element: <QuotationDetailPage /> },
      { path: "customers", element: <CustomersListPage /> },
      { path: "customers/new", element: <CustomerFormPage /> },
      { path: "customers/:id/edit", element: <CustomerFormPage /> },
      { path: "suppliers", element: <SuppliersListPage /> },
      { path: "suppliers/new", element: <SupplierFormPage /> },
      { path: "suppliers/:id/edit", element: <SupplierFormPage /> },
      { path: "purchases", element: <PurchasesListPage /> },
      { path: "purchases/new", element: <PurchaseFormPage /> },
      { path: "purchases/:id", element: <PurchaseDetailPage /> },
      { path: "sales-returns", element: <SalesReturnsListPage /> },
      { path: "sales-returns/new", element: <SalesReturnFormPage /> },
      { path: "purchase-returns", element: <PurchaseReturnsListPage /> },
      { path: "purchase-returns/new", element: <PurchaseReturnFormPage /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "expenses", element: <ExpensesPage /> },
      { path: "income", element: <IncomePage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "company", element: <CompanySettingsPage /> }
    ]
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["SuperAdmin"]}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <SuperAdminDashboardPage /> },
      { path: "companies", element: <CompaniesPage /> },
      { path: "plans", element: <SubscriptionPlansPage /> }
    ]
  },
  { path: "*", element: <Navigate to="/login" replace /> }
], { basename: import.meta.env.BASE_URL });
