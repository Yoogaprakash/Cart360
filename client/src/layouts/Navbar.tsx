import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Badge from "@mui/material/Badge";
import { useState } from "react";
import { FiMenu, FiSun, FiMoon, FiBell, FiLogOut, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useThemeMode } from "../theme/ThemeModeContext";
import { SIDEBAR_WIDTH } from "./Sidebar";

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const initials = user ? `${user.firstName[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "?";

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{ width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` }, ml: { md: `${SIDEBAR_WIDTH}px` } }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton edge="start" onClick={onMenuClick} sx={{ display: { md: "none" } }}>
          <FiMenu />
        </IconButton>

        {user?.tenantName && (
          <Typography variant="subtitle1" sx={{ fontWeight: 700, display: { xs: "none", sm: "block" } }}>
            {user.tenantName}
          </Typography>
        )}

        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", ml: "auto" }}>
          <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton onClick={toggleMode}>{mode === "dark" ? <FiSun /> : <FiMoon />}</IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton>
              <Badge color="secondary" variant="dot">
                <FiBell />
              </Badge>
            </IconButton>
          </Tooltip>

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: 14, backgroundImage: "linear-gradient(135deg, #6366F1, #EC4899)" }}>
              {initials}
            </Avatar>
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <Stack sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Stack>
            <Divider />
            <MenuItem onClick={() => setAnchorEl(null)}>
              <FiUser style={{ marginRight: 10 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <FiLogOut style={{ marginRight: 10 }} /> Logout
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
