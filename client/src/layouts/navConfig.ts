import {
  FiGrid, FiFileText, FiClipboard, FiBox, FiUsers, FiTruck,
  FiShoppingCart, FiLayers, FiDollarSign, FiBarChart2,
  FiSettings, FiUserCheck, FiCreditCard, FiShield, FiHash,
  FiTag, FiAward, FiHome, FiRotateCcw, FiCornerUpLeft, FiTrendingUp
} from "react-icons/fi";
import type { IconType } from "react-icons";
import type { UserRole } from "../lib/types";

export interface NavItem {
  label: string;
  path: string;
  icon: IconType;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  { label: "Dashboard", path: "/app/dashboard", icon: FiGrid, roles: ["CompanyAdmin", "Employee", "CompanyUser"] },
  { label: "Invoices", path: "/app/invoices", icon: FiFileText, roles: ["CompanyAdmin", "Employee", "CompanyUser"] },
  { label: "Quotations", path: "/app/quotations", icon: FiClipboard, roles: ["CompanyAdmin", "Employee", "CompanyUser"] },
  { label: "Sales Returns", path: "/app/sales-returns", icon: FiCornerUpLeft, roles: ["CompanyAdmin", "Employee"] },
  { label: "Products", path: "/app/products", icon: FiBox, roles: ["CompanyAdmin", "Employee"] },
  { label: "Categories", path: "/app/categories", icon: FiTag, roles: ["CompanyAdmin", "Employee"] },
  { label: "Brands", path: "/app/brands", icon: FiAward, roles: ["CompanyAdmin", "Employee"] },
  { label: "Units", path: "/app/units", icon: FiHash, roles: ["CompanyAdmin", "Employee"] },
  { label: "Warehouses", path: "/app/warehouses", icon: FiHome, roles: ["CompanyAdmin", "Employee"] },
  { label: "Customers", path: "/app/customers", icon: FiUsers, roles: ["CompanyAdmin", "Employee"] },
  { label: "Suppliers", path: "/app/suppliers", icon: FiTruck, roles: ["CompanyAdmin", "Employee"] },
  { label: "Purchases", path: "/app/purchases", icon: FiShoppingCart, roles: ["CompanyAdmin", "Employee"] },
  { label: "Purchase Returns", path: "/app/purchase-returns", icon: FiRotateCcw, roles: ["CompanyAdmin", "Employee"] },
  { label: "Inventory", path: "/app/inventory", icon: FiLayers, roles: ["CompanyAdmin", "Employee"] },
  { label: "Expenses", path: "/app/expenses", icon: FiDollarSign, roles: ["CompanyAdmin", "Employee"] },
  { label: "Income", path: "/app/income", icon: FiTrendingUp, roles: ["CompanyAdmin", "Employee"] },
  { label: "Reports", path: "/app/reports", icon: FiBarChart2, roles: ["CompanyAdmin"] },
  { label: "Users", path: "/app/users", icon: FiUserCheck, roles: ["CompanyAdmin"] },
  { label: "Company Settings", path: "/app/company", icon: FiSettings, roles: ["CompanyAdmin"] }
];

export const superAdminNavItems: NavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard", icon: FiGrid, roles: ["SuperAdmin"] },
  { label: "Companies", path: "/admin/companies", icon: FiShield, roles: ["SuperAdmin"] },
  { label: "Subscription Plans", path: "/admin/plans", icon: FiCreditCard, roles: ["SuperAdmin"] }
];
