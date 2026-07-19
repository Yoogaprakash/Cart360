import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { getErrorMessage } from "../../../lib/errorMessage";
import {
  useCreateIncome,
  useCreateIncomeCategory,
  useDeleteIncome,
  useIncomeCategoriesQuery,
  useIncomeQuery
} from "../api/useIncome";
import type { PaymentMethod } from "../types";

const todayIso = () => new Date().toISOString().slice(0, 10);

export function IncomePage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, isFetching } = useIncomeQuery({ page, pageSize });
  const { data: categories } = useIncomeCategoriesQuery();
  const createIncome = useCreateIncome();
  const createCategory = useCreateIncomeCategory();
  const deleteIncome = useDeleteIncome();

  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [amount, setAmount] = useState("");
  const [incomeDate, setIncomeDate] = useState(todayIso());
  const [source, setSource] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setCategoryId(""); setAmount(""); setIncomeDate(todayIso());
    setSource(""); setPaymentMethod("Cash"); setNotes(""); setError(null);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const category = await createCategory.mutateAsync(newCategoryName.trim());
      setCategoryId(category.id);
      setNewCategoryName("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCreate = async () => {
    setError(null);
    try {
      await createIncome.mutateAsync({
        incomeCategoryId: categoryId,
        amount: Number(amount),
        incomeDate,
        source: source || null,
        paymentMethod,
        notes: notes || null
      });
      setOpen(false);
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Other Income</Typography>
        <Button variant="contained" startIcon={<FiPlus />} onClick={() => setOpen(true)}>New Income</Button>
      </Stack>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : (data?.items.length ?? 0) === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>No income recorded yet.</TableCell></TableRow>
            ) : (
              data?.items.map((income) => (
                <TableRow key={income.id} hover sx={{ opacity: isFetching ? 0.6 : 1 }}>
                  <TableCell>{new Date(income.incomeDate).toLocaleDateString()}</TableCell>
                  <TableCell>{income.incomeCategoryName}</TableCell>
                  <TableCell>{income.source ?? "—"}</TableCell>
                  <TableCell>{income.paymentMethod}</TableCell>
                  <TableCell align="right">₹{income.amount.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => deleteIncome.mutate(income.id)}>
                      <FiTrash2 size={15} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {data && (
          <TablePagination
            component="div" count={data.totalCount} page={page - 1}
            onPageChange={(_, p) => setPage(p + 1)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        )}
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New Income</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} fullWidth>
              {(categories ?? []).map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>

            <Stack direction="row" spacing={1}>
              <TextField label="New category" size="small" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} fullWidth />
              <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>Add</Button>
            </Stack>

            <Divider />

            <TextField label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} fullWidth />
            <TextField label="Date" type="date" value={incomeDate} onChange={(e) => setIncomeDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            <TextField label="Source (optional)" value={source} onChange={(e) => setSource(e.target.value)} fullWidth />
            <TextField select label="Payment method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} fullWidth>
              {(["Cash", "UPI", "Bank", "Card"] as PaymentMethod[]).map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
            <TextField label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} multiline rows={2} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!categoryId || !amount || createIncome.isPending}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
