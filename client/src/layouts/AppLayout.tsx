import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppBreadcrumbs } from "../components/AppBreadcrumbs";
import { Navbar } from "./Navbar";
import { Sidebar, SIDEBAR_WIDTH } from "./Sidebar";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex" }}>
      <Box component="nav" sx={{ width: { md: SIDEBAR_WIDTH }, flexShrink: { md: 0 } }}>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <Sidebar variant="permanent" open onClose={() => {}} />
        </Box>
        <Box sx={{ display: { xs: "block", md: "none" } }}>
          <Sidebar variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} />
        </Box>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 }, flex: 1 }}>
          <AppBreadcrumbs />
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
