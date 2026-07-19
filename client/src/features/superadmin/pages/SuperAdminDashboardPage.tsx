import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useSuperAdminDashboardQuery } from "../api/useSuperAdminDashboard";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card sx={{ p: 2.5, flex: 1, minWidth: 160 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>{value}</Typography>
    </Card>
  );
}

export function SuperAdminDashboardPage() {
  const { data, isLoading } = useSuperAdminDashboardQuery();

  if (isLoading || !data) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>Super Admin Dashboard</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard label="Total Companies" value={String(data.totalCompanies)} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard label="Active Companies" value={String(data.activeCompanies)} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard label="Pending Companies" value={String(data.pendingCompanies)} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard label="Suspended Companies" value={String(data.suspendedCompanies)} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard label="Total Users" value={String(data.totalUsers)} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}><StatCard label="Monthly Recurring Revenue" value={`₹${data.monthlyRecurringRevenue.toFixed(2)}`} /></Grid>
      </Grid>

      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Monthly Growth</Typography>
      <Card>
        <Table size="small">
          <TableHead>
            <TableRow><TableCell>Month</TableCell><TableCell align="right">New Companies</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {data.monthlyGrowth.length === 0 ? (
              <TableRow><TableCell colSpan={2} align="center" sx={{ py: 4, color: "text.secondary" }}>No growth data yet.</TableCell></TableRow>
            ) : (
              data.monthlyGrowth.map((row) => (
                <TableRow key={`${row.year}-${row.month}`}>
                  <TableCell>{MONTH_NAMES[row.month - 1]} {row.year}</TableCell>
                  <TableCell align="right">{row.newCompanies}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </Stack>
  );
}
