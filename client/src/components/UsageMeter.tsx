import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

interface UsageMeterProps {
  label: string;
  current: number;
  max: number;
}

/** Status is never color-alone: the percentage and "x / y" figures are always visible alongside the bar. */
export function UsageMeter({ label, current, max }: UsageMeterProps) {
  const theme = useTheme();
  const percent = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;

  const color = percent >= 90 ? theme.palette.error.main : percent >= 70 ? theme.palette.warning.main : theme.palette.success.main;

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.75 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {current} / {max} ({percent}%)
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.palette.action.hover,
          "& .MuiLinearProgress-bar": { backgroundColor: color, borderRadius: 4 }
        }}
      />
    </Box>
  );
}
