import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { navItems, superAdminNavItems } from "./navConfig";

export const SIDEBAR_WIDTH = 260;

interface SidebarProps {
  variant: "permanent" | "temporary";
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ variant, open, onClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const items = user.role === "SuperAdmin" ? superAdminNavItems : navItems.filter((item) => item.roles.includes(user.role));

  const content = (
    <Box sx={{ width: SIDEBAR_WIDTH, height: "100%", display: "flex", flexDirection: "column" }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", px: 2.5, py: 2.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            backgroundImage: "linear-gradient(135deg, #6366F1, #EC4899)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: 15
          }}
        >
          C
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Cart360
        </Typography>
      </Stack>

      <List sx={{ px: 1.5, flex: 1, overflowY: "auto" }}>
        {items.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.path}
              selected={isActive}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundImage: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.10))"
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon size={18} />
              </ListItemIcon>
              <ListItemText slotProps={{ primary: { sx: { fontWeight: isActive ? 700 : 500 } } }}>{item.label}</ListItemText>
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  if (variant === "permanent") {
    return (
      <Drawer variant="permanent" open sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, boxSizing: "border-box" } }}>
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer variant="temporary" open={open} onClose={onClose} ModalProps={{ keepMounted: true }}>
      {content}
    </Drawer>
  );
}
