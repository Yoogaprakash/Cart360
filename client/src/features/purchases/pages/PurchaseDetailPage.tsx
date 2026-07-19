import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { FiXCircle, FiDollarSign } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { getErrorMessage } from "../../../lib/errorMessage";
import { useAuth } from "../../../store/AuthContext";
import { useMyCompanyQuery } from "../../company/api/useCompany";
import { useCancelPurchase, usePurchaseQuery, useRecordPurchasePayment } from "../api/usePurchases";
import type { PurchaseStatus } from "../types";

const STATUS_COLOR: Record<PurchaseStatus, "default" | "success" | "error"> = {
  Draft: "default", Received: "success", Cancelled: "error"
};

export function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const { data: purchase, isLoading } = usePurchaseQuery(id);
  const { data: company } = useMyCompanyQuery();
  const recordPayment = useRecordPurchasePayment();
  const cancelPurchase = useCancelPurchase();

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !purchase || !company) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  const handleRecordPayment = async () => {
    setError(null);
    try {
      await recordPayment.mutateAsync({ id: purchase.id, amount: Number(paymentAmount) });
      setPaymentDialogOpen(false);
      setPaymentAmount("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 800 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <Stack>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{purchase.purchaseNumber}</Typography>
          <Typography variant="body2" color="text.secondary">
            {purchase.supplierName} · {new Date(purchase.purchaseDate).toLocaleDateString()}
            {purchase.referenceBillNumber ? ` · Ref: ${purchase.referenceBillNumber}` : ""}
          </Typography>
        </Stack>
        <Chip label={purchase.status} color={STATUS_COLOR[purchase.status]} />
      </Stack>

      <Stack direction="row" spacing={1.5}>
        {purchase.balanceAmount > 0 && purchase.status !== "Cancelled" && hasPermission("Purchases", "edit") && (
          <Button variant="outlined" startIcon={<FiDollarSign />} onClick={() => setPaymentDialogOpen(true)}>
            Record Payment
          </Button>
        )}
        {purchase.status !== "Cancelled" && hasPermission("Purchases", "delete") && (
          <Button variant="outlined" color="error" startIcon={<FiXCircle />} onClick={() => cancelPurchase.mutate(purchase.id)}>
            Cancel Purchase
          </Button>
        )}
      </Stack>

      <Card>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                {company.isGstEnabled && <TableCell align="right">GST</TableCell>}
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchase.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">₹{item.unitPrice.toFixed(2)}</TableCell>
                  {company.isGstEnabled && <TableCell align="right">₹{(item.cgstAmount + item.sgstAmount).toFixed(2)}</TableCell>}
                  <TableCell align="right">₹{item.totalAmount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={0.75} sx={{ ml: "auto", maxWidth: 280 }}>
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Subtotal</Typography>
              <Typography variant="body2">₹{purchase.subtotal.toFixed(2)}</Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Discount</Typography>
              <Typography variant="body2">−₹{purchase.discountAmount.toFixed(2)}</Typography>
            </Stack>
            {company.isGstEnabled && (
              <>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">CGST</Typography>
                  <Typography variant="body2">₹{purchase.cgstAmount.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">SGST</Typography>
                  <Typography variant="body2">₹{purchase.sgstAmount.toFixed(2)}</Typography>
                </Stack>
              </>
            )}
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Round off</Typography>
              <Typography variant="body2">₹{purchase.roundOff.toFixed(2)}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Grand Total</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>₹{purchase.grandTotal.toFixed(2)}</Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Paid</Typography>
              <Typography variant="body2">₹{purchase.paidAmount.toFixed(2)}</Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="body2" color="error">Balance Due</Typography>
              <Typography variant="body2" color="error">₹{purchase.balanceAmount.toFixed(2)}</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <Typography variant="body2" color="text.secondary">Balance due: ₹{purchase.balanceAmount.toFixed(2)}</Typography>
            <TextField
              autoFocus
              label="Amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!paymentAmount || Number(paymentAmount) <= 0} onClick={handleRecordPayment}>
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
