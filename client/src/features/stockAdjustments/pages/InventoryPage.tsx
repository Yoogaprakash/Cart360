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
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { getErrorMessage } from "../../../lib/errorMessage";
import { useProductsQuery } from "../../products/api/useProducts";
import { useInventoryReportQuery } from "../../reports/api/useReports";
import { useCreateStockAdjustment, useStockAdjustmentsQuery } from "../api/useStockAdjustments";

interface AdjustmentRow {
  productId: string;
  actualQuantity: string;
}

export function InventoryPage() {
  const { data: inventory, isLoading: isInventoryLoading } = useInventoryReportQuery();
  const { data: products } = useProductsQuery({ page: 1, pageSize: 500 });
  const { data: adjustments } = useStockAdjustmentsQuery({ page: 1, pageSize: 10 });
  const createAdjustment = useCreateStockAdjustment();

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [rows, setRows] = useState<AdjustmentRow[]>([{ productId: "", actualQuantity: "" }]);
  const [error, setError] = useState<string | null>(null);

  const productById = useMemo(() => new Map((products?.items ?? []).map((p) => [p.id, p])), [products]);

  const resetForm = () => {
    setReason("");
    setRows([{ productId: "", actualQuantity: "" }]);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    const items = rows
      .filter((r) => r.productId && r.actualQuantity !== "")
      .map((r) => ({ productId: r.productId, actualQuantity: Number(r.actualQuantity) }));

    if (items.length === 0) {
      setError("Add at least one product with an actual quantity.");
      return;
    }

    try {
      await createAdjustment.mutateAsync({ reason: reason || null, notes: null, items });
      setOpen(false);
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Inventory</Typography>
        <Button variant="contained" startIcon={<FiPlus />} onClick={() => setOpen(true)}>New Stock Adjustment</Button>
      </Stack>

      {inventory && (
        <Stack direction="row" spacing={2}>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography variant="body2" color="text.secondary">Total Stock Value</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>₹{inventory.totalStockValue.toFixed(2)}</Typography>
          </Card>
          <Card sx={{ flex: 1, p: 2 }}>
            <Typography variant="body2" color="text.secondary">Low Stock Products</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: inventory.lowStockCount > 0 ? "error.main" : undefined }}>
              {inventory.lowStockCount}
            </Typography>
          </Card>
        </Stack>
      )}

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell align="right">Current Stock</TableCell>
              <TableCell align="right">Min Level</TableCell>
              <TableCell align="right">Stock Value</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isInventoryLoading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : (inventory?.rows.length ?? 0) === 0 ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>No products yet.</TableCell></TableRow>
            ) : (
              inventory?.rows.map((row) => (
                <TableRow key={row.productId} hover>
                  <TableCell>{row.productName}</TableCell>
                  <TableCell>{row.sku}</TableCell>
                  <TableCell align="right">{row.currentStock}</TableCell>
                  <TableCell align="right">{row.minStockLevel}</TableCell>
                  <TableCell align="right">₹{row.stockValue.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={row.isLowStock ? "Low Stock" : "OK"} color={row.isLowStock ? "warning" : "success"} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Stock Adjustments</Typography>
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Adjustment #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell align="right">Items</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(adjustments?.items.length ?? 0) === 0 ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>No stock adjustments yet.</TableCell></TableRow>
            ) : (
              adjustments?.items.map((adj) => (
                <TableRow key={adj.id} hover>
                  <TableCell>{adj.adjustmentNumber}</TableCell>
                  <TableCell>{new Date(adj.adjustmentDate).toLocaleDateString()}</TableCell>
                  <TableCell>{adj.reason ?? "—"}</TableCell>
                  <TableCell align="right">{adj.items.length}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Stock Adjustment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth />

            <Divider />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">System Qty</TableCell>
                  <TableCell width={120} align="right">Actual Qty</TableCell>
                  <TableCell width={40} />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => {
                  const product = productById.get(row.productId);
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          fullWidth
                          value={row.productId}
                          onChange={(e) => {
                            const next = [...rows];
                            next[index] = { ...next[index], productId: e.target.value };
                            setRows(next);
                          }}
                        >
                          {(products?.items ?? []).map((p) => (
                            <MenuItem key={p.id} value={p.id}>{p.name} ({p.sku})</MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell align="right">{product?.currentStock ?? "—"}</TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          size="small"
                          value={row.actualQuantity}
                          onChange={(e) => {
                            const next = [...rows];
                            next[index] = { ...next[index], actualQuantity: e.target.value };
                            setRows(next);
                          }}
                          sx={{ width: 90 }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="error" disabled={rows.length === 1} onClick={() => setRows(rows.filter((_, i) => i !== index))}>
                          <FiTrash2 size={15} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Button size="small" startIcon={<FiPlus />} onClick={() => setRows([...rows, { productId: "", actualQuantity: "" }])} sx={{ alignSelf: "flex-start" }}>
              Add product
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={createAdjustment.isPending}>
            {createAdjustment.isPending ? "Saving…" : "Save adjustment"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
