import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { FiTool } from "react-icons/fi";

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <Stack spacing={2} sx={{ alignItems: "center", justifyContent: "center", py: 10, textAlign: "center" }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "action.hover",
          color: "primary.main"
        }}
      >
        <FiTool size={24} />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
        This module is under active development and will be available in an upcoming update.
      </Typography>
    </Stack>
  );
}
