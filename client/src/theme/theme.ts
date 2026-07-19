import { createTheme, type PaletteMode } from "@mui/material/styles";

const brand = {
  main: "#6366F1",
  light: "#818CF8",
  dark: "#4338CA"
};

export function buildTheme(mode: PaletteMode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: brand,
      secondary: { main: "#EC4899" },
      background: {
        default: isDark ? "#0B0F19" : "#F6F7FB",
        paper: isDark ? "#121826" : "#FFFFFF"
      },
      divider: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)"
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: '"Inter", "Segoe UI", Roboto, system-ui, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: "none" }
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none"
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)"}`,
            boxShadow: isDark
              ? "0 1px 2px rgba(0,0,0,0.4)"
              : "0 1px 2px rgba(15,23,42,0.04), 0 1px 12px rgba(15,23,42,0.03)"
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10 },
          contained: {
            backgroundImage: `linear-gradient(135deg, ${brand.main}, ${brand.dark})`
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: isDark ? "rgba(18,24,38,0.8)" : "rgba(255,255,255,0.8)",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)"}`
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)"}`
          }
        }
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600 } }
      }
    }
  });
}
