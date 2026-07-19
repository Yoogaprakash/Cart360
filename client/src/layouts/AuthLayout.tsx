import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Outlet } from "react-router-dom";
import { useThemeMode } from "../theme/ThemeModeContext";

export function AuthLayout() {
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        backgroundImage: isDark
          ? "radial-gradient(circle at 15% 15%, rgba(99,102,241,0.25), transparent 45%), radial-gradient(circle at 85% 85%, rgba(236,72,153,0.18), transparent 45%)"
          : "radial-gradient(circle at 15% 15%, rgba(99,102,241,0.12), transparent 45%), radial-gradient(circle at 85% 85%, rgba(236,72,153,0.10), transparent 45%)"
      }}
    >
      <Stack spacing={3} sx={{ width: "100%", maxWidth: 440 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", justifyContent: "center" }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundImage: "linear-gradient(135deg, #6366F1, #EC4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800
            }}
          >
            C
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Cart360
          </Typography>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            backdropFilter: "blur(20px)",
            backgroundColor: isDark ? "rgba(18,24,38,0.7)" : "rgba(255,255,255,0.85)"
          }}
        >
          <Outlet />
        </Paper>
      </Stack>
    </Box>
  );
}
