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
  useCreateExpense,
  useCreateExpenseCategory,
  useDeleteExpense,
  useExpenseCategoriesQuery,
  useExpensesQuery
} from "../api/useExpenses";
import type { PaymentMethod } from "../types";

const todayIso = () => new Date().toISOString().slice(0, 10);

export function ExpensesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, isFetching } = useExpensesQuery({ page, pageSize });
  const { data: categories } = useExpenseCategoriesQuery();
  const createExpense = useCreateExpense();
  const createCategory = useCreateExpenseCategory();
  const deleteExpense = useDeleteExpense();

  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(todayIso());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setCategoryId(""); setAmount(""); setExpenseDate(todayIso());
    setPaymentMethod("Cash"); setReferenceNumber(""); setNotes(""); setError(null);
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
      await createExpense.mutateAsync({
        expenseCategoryId: categoryId,
        amount: Number(amount),
        expenseDate,
        paymentMethod,
        referenceNumber: referenceNumber || null,
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
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Expenses</Typography>
        <Button variant="contained" startIcon={<FiPlus />} onClick={() => setOpen(true)}>New Expense</Button>
      </Stack>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : (data?.items.length ?? 0) === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>No expenses recorded yet.</TableCell></TableRow>
            ) : (
              data?.items.map((expense) => (
                <TableRow key={expense.id} hover sx={{ opacity: isFetching ? 0.6 : 1 }}>
                  <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                  <TableCell>{expense.expenseCategoryName}</TableCell>
                  <TableCell>{expense.paymentMethod}</TableCell>
                  <TableCell align="right">₹{expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{expense.notes ?? "—"}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => deleteExpense.mutate(expense.id)}>
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
        <DialogTitle>New Expense</DialogTitle>
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
            <TextField label="Date" type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            <TextField select label="Payment method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} fullWidth>
              {(["Cash", "UPI", "Bank", "Card"] as PaymentMethod[]).map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
            <TextField label="Reference number (optional)" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} fullWidth />
            <TextField label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} multiline rows={2} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!categoryId || !amount || createExpense.isPending}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
