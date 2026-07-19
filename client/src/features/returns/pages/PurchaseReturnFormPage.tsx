import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
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
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../../lib/errorMessage";
import { usePurchaseQuery, usePurchasesQuery } from "../../purchases/api/usePurchases";
import { useCreatePurchaseReturn } from "../api/useReturns";

export function PurchaseReturnFormPage() {
  const navigate = useNavigate();
  const [purchaseId, setPurchaseId] = useState("");
  const [reason, setReason] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: purchases } = usePurchasesQuery({ page: 1, pageSize: 200 });
  const { data: purchase, isLoading: isPurchaseLoading } = usePurchaseQuery(purchaseId || undefined);
  const createPurchaseReturn = useCreatePurchaseReturn();

  const eligiblePurchases = useMemo(() => (purchases?.items ?? []).filter((p) => p.status !== "Cancelled"), [purchases]);

  const handlePurchaseChange = (id: string) => {
    setPurchaseId(id);
    setQuantities({});
  };

  const handleSubmit = async () => {
    setServerError(null);
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([purchaseItemId, quantity]) => ({ purchaseItemId, quantity }));

    if (!purchaseId || items.length === 0) {
      setServerError("Select a purchase and enter a return quantity for at least one item.");
      return;
    }

    try {
      await createPurchaseReturn.mutateAsync({ purchaseId, reason: reason || null, items });
      navigate(`/app/purchase-returns`);
    } catch (error) {
      setServerError(getErrorMessage(error, "Unable to create the purchase return."));
    }
  };

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 800 }}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>New Purchase Return</Typography>

      <Card>
        <CardContent>
          <Stack spacing={2.5}>
            {serverError && <Alert severity="error">{serverError}</Alert>}

            <TextField select label="Purchase" value={purchaseId} onChange={(e) => handlePurchaseChange(e.target.value)} fullWidth>
              {eligiblePurchases.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.purchaseNumber} — {p.supplierName} (₹{p.grandTotal.toFixed(2)})</MenuItem>
              ))}
            </TextField>

            <TextField label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} multiline rows={2} fullWidth />

            {isPurchaseLoading && purchaseId && (
              <Stack sx={{ alignItems: "center", py: 4 }}><CircularProgress size={24} /></Stack>
            )}

            {purchase && (
              <>
                <Divider />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Select items to return</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Purchased Qty</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell width={120} align="right">Return Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchase.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">₹{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={quantities[item.id] ?? ""}
                            onChange={(e) => {
                              const value = Math.max(0, Math.min(item.quantity, Number(e.target.value) || 0));
                              setQuantities((prev) => ({ ...prev, [item.id]: value }));
                            }}
                            slotProps={{ htmlInput: { min: 0, max: item.quantity } }}
                            sx={{ width: 90 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}

            <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
              <Button onClick={() => navigate("/app/purchase-returns")}>Cancel</Button>
              <Button variant="contained" disabled={!purchaseId || createPurchaseReturn.isPending} onClick={handleSubmit}>
                {createPurchaseReturn.isPending ? "Saving…" : "Create return"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
