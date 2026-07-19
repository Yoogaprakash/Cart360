import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { IconType } from "react-icons";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: IconType;
  accent?: string;
  helperText?: string;
}

export function StatCard({ label, value, icon: Icon, accent = "#6366F1", helperText }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {value}
            </Typography>
            {helperText && (
              <Typography variant="caption" color="text.secondary">
                {helperText}
              </Typography>
            )}
          </Stack>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${accent}1A`,
              color: accent
            }}
          >
            <Icon size={20} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
