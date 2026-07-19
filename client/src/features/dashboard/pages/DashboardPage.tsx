import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { FiBox, FiAlertTriangle, FiLayers } from "react-icons/fi";
import { StatCard } from "../../../components/StatCard";
import { UsageMeter } from "../../../components/UsageMeter";
import { useAuth } from "../../../store/AuthContext";
import { useDashboardSummary } from "../api/useDashboardSummary";

const LIMIT_LABELS: Record<string, string> = {
  Users: "Users",
  Products: "Products",
  Customers: "Customers",
  MonthlyInvoices: "Invoices this month"
};

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useDashboardSummary();

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Welcome back, {user?.firstName} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Here's what's happening with {user?.tenantName ?? "your company"} today.
        </Typography>
      </Stack>

      {isLoading && (
        <Stack sx={{ alignItems: "center", py: 6 }}>
          <CircularProgress />
        </Stack>
      )}

      {isError && <Alert severity="error">Couldn't load dashboard data. Try refreshing the page.</Alert>}

      {data && (
        <>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard label="Total Products" value={data.totalProducts} icon={FiBox} accent="#6366F1" />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard
                label="Low Stock Alerts"
                value={data.lowStockProducts}
                icon={FiAlertTriangle}
                accent="#EC4899"
                helperText={data.lowStockProducts > 0 ? "Needs attention" : "All good"}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard label="Units of Measure" value={data.totalUnits} icon={FiLayers} accent="#1BAF7A" />
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
                Plan usage
              </Typography>
              <Stack spacing={2.5}>
                {data.planUsage.map((usage) => (
                  <UsageMeter key={usage.limitType} label={LIMIT_LABELS[usage.limitType] ?? usage.limitType} current={usage.current} max={usage.max} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  );
}
