import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { FiEdit2, FiPlus } from "react-icons/fi";
import { getErrorMessage } from "../../../lib/errorMessage";
import { useCreateSubscriptionPlan, useSubscriptionPlansQuery, useUpdateSubscriptionPlan } from "../api/useSubscriptionPlans";
import type { SubscriptionPlan, UpsertSubscriptionPlanRequest } from "../types";

const emptyForm: UpsertSubscriptionPlanRequest = {
  name: "", code: "", description: "", monthlyPrice: 0, yearlyPrice: 0, currency: "INR",
  maxUsers: 1, maxEmployees: 0, maxProducts: 100, maxCustomers: 100, maxSuppliers: 50,
  maxMonthlyInvoices: 100, maxMonthlyQuotations: 50, maxMonthlyPrints: 100, maxStorageMb: 500, maxWarehouses: 1,
  canExportPdf: true, canExportExcel: false, canPrint: true, canAddLogo: false, canAddGst: true, canAddMultiBranch: false, canUseApi: false,
  isActive: true, sortOrder: 0
};

const NUMERIC_FIELDS: { key: keyof UpsertSubscriptionPlanRequest; label: string }[] = [
  { key: "maxUsers", label: "Max Users" },
  { key: "maxEmployees", label: "Max Employees" },
  { key: "maxProducts", label: "Max Products" },
  { key: "maxCustomers", label: "Max Customers" },
  { key: "maxSuppliers", label: "Max Suppliers" },
  { key: "maxMonthlyInvoices", label: "Max Monthly Invoices" },
  { key: "maxMonthlyQuotations", label: "Max Monthly Quotations" },
  { key: "maxMonthlyPrints", label: "Max Monthly Prints" },
  { key: "maxStorageMb", label: "Max Storage (MB)" },
  { key: "maxWarehouses", label: "Max Warehouses" }
];

const FEATURE_FIELDS: { key: keyof UpsertSubscriptionPlanRequest; label: string }[] = [
  { key: "canExportPdf", label: "PDF export" },
  { key: "canExportExcel", label: "Excel export" },
  { key: "canPrint", label: "Print" },
  { key: "canAddLogo", label: "Company logo" },
  { key: "canAddGst", label: "GST" },
  { key: "canAddMultiBranch", label: "Multi-branch" },
  { key: "canUseApi", label: "API access" }
];

export function SubscriptionPlansPage() {
  const { data: plans, isLoading } = useSubscriptionPlansQuery();
  const createPlan = useCreateSubscriptionPlan();
  const updatePlan = useUpdateSubscriptionPlan();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UpsertSubscriptionPlanRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setOpen(true);
  };

  const openEdit = (plan: SubscriptionPlan) => {
    const { id, ...rest } = plan;
    void id;
    setEditingId(plan.id);
    setForm(rest);
    setError(null);
    setOpen(true);
  };

  const setField = <K extends keyof UpsertSubscriptionPlanRequest>(key: K, value: UpsertSubscriptionPlanRequest[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      if (editingId) await updatePlan.mutateAsync({ id: editingId, payload: form });
      else await createPlan.mutateAsync(form);
      setOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Subscription Plans</Typography>
        <Button variant="contained" startIcon={<FiPlus />} onClick={openCreate}>New Plan</Button>
      </Stack>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plan</TableCell>
              <TableCell align="right">Monthly Price</TableCell>
              <TableCell align="right">Yearly Price</TableCell>
              <TableCell align="right">Max Users</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : (plans?.length ?? 0) === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>No subscription plans yet.</TableCell></TableRow>
            ) : (
              plans?.map((plan) => (
                <TableRow key={plan.id} hover>
                  <TableCell>
                    <Stack>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{plan.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{plan.code}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">{plan.currency} {plan.monthlyPrice.toFixed(2)}</TableCell>
                  <TableCell align="right">{plan.currency} {plan.yearlyPrice.toFixed(2)}</TableCell>
                  <TableCell align="right">{plan.maxUsers}</TableCell>
                  <TableCell><Chip size="small" label={plan.isActive ? "Active" : "Inactive"} color={plan.isActive ? "success" : "default"} /></TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<FiEdit2 size={14} />} onClick={() => openEdit(plan)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Edit Plan" : "New Plan"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Name" value={form.name} onChange={(e) => setField("name", e.target.value)} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Code" value={form.code} onChange={(e) => setField("code", e.target.value)} fullWidth /></Grid>
              <Grid size={12}><TextField label="Description" value={form.description ?? ""} onChange={(e) => setField("description", e.target.value)} multiline rows={2} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><TextField label="Monthly price" type="number" value={form.monthlyPrice} onChange={(e) => setField("monthlyPrice", Number(e.target.value))} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><TextField label="Yearly price" type="number" value={form.yearlyPrice} onChange={(e) => setField("yearlyPrice", Number(e.target.value))} fullWidth /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><TextField label="Currency" value={form.currency} onChange={(e) => setField("currency", e.target.value)} fullWidth /></Grid>
            </Grid>

            <Divider />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Limits</Typography>
            <Grid container spacing={2}>
              {NUMERIC_FIELDS.map(({ key, label }) => (
                <Grid key={key} size={{ xs: 6, sm: 4 }}>
                  <TextField
                    label={label}
                    type="number"
                    size="small"
                    value={form[key] as number}
                    onChange={(e) => setField(key, Number(e.target.value) as never)}
                    fullWidth
                  />
                </Grid>
              ))}
            </Grid>

            <Divider />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Features</Typography>
            <Grid container spacing={1}>
              {FEATURE_FIELDS.map(({ key, label }) => (
                <Grid key={key} size={{ xs: 6, sm: 4 }}>
                  <FormControlLabel
                    control={<Switch checked={form[key] as boolean} onChange={(e) => setField(key, e.target.checked as never)} />}
                    label={label}
                  />
                </Grid>
              ))}
            </Grid>

            <Divider />
            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={<Switch checked={form.isActive} onChange={(e) => setField("isActive", e.target.checked)} />}
                label="Active"
              />
              <TextField label="Sort order" type="number" size="small" value={form.sortOrder} onChange={(e) => setField("sortOrder", Number(e.target.value))} sx={{ width: 140 }} />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!form.name || !form.code || createPlan.isPending || updatePlan.isPending}>
            {editingId ? "Save changes" : "Create plan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
