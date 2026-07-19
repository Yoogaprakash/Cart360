import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { FiChevronDown, FiRepeat } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../../../lib/errorMessage";
import { useAuth } from "../../../store/AuthContext";
import { useMyCompanyQuery } from "../../company/api/useCompany";
import { useConvertQuotationToInvoice, useQuotationQuery, useUpdateQuotationStatus } from "../api/useQuotations";
import type { QuotationStatus } from "../types";

const STATUS_COLOR: Record<QuotationStatus, "default" | "warning" | "info" | "success" | "error"> = {
  Draft: "default", Sent: "info", Accepted: "success", Rejected: "error", Expired: "warning", Converted: "success"
};

const STATUS_OPTIONS: QuotationStatus[] = ["Draft", "Sent", "Accepted", "Rejected", "Expired"];

export function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { data: quotation, isLoading } = useQuotationQuery(id);
  const { data: company } = useMyCompanyQuery();
  const updateStatus = useUpdateQuotationStatus();
  const convertToInvoice = useConvertQuotationToInvoice();

  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !quotation || !company) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  const handleStatusChange = async (status: QuotationStatus) => {
    setStatusMenuAnchor(null);
    setError(null);
    try {
      await updateStatus.mutateAsync({ id: quotation.id, status });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleConvert = async () => {
    setError(null);
    try {
      const invoice = await convertToInvoice.mutateAsync(quotation.id);
      navigate(`/app/invoices/${invoice.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const canConvert = quotation.status !== "Converted" && quotation.status !== "Rejected" && quotation.status !== "Expired";

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 800 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <Stack>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{quotation.quotationNumber}</Typography>
          <Typography variant="body2" color="text.secondary">
            {quotation.customerName} · {new Date(quotation.quotationDate).toLocaleDateString()}
            {quotation.expiryDate ? ` · Expires ${new Date(quotation.expiryDate).toLocaleDateString()}` : ""}
          </Typography>
        </Stack>
        <Chip label={quotation.status} color={STATUS_COLOR[quotation.status]} />
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Stack direction="row" spacing={1.5}>
        {hasPermission("Quotations", "edit") && quotation.status !== "Converted" && (
          <>
            <Button variant="outlined" endIcon={<FiChevronDown />} onClick={(e) => setStatusMenuAnchor(e.currentTarget)}>
              Change status
            </Button>
            <Menu anchorEl={statusMenuAnchor} open={Boolean(statusMenuAnchor)} onClose={() => setStatusMenuAnchor(null)}>
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} onClick={() => handleStatusChange(s)}>{s}</MenuItem>
              ))}
            </Menu>
          </>
        )}
        {canConvert && hasPermission("Quotations", "edit") && (
          <Button variant="contained" startIcon={<FiRepeat />} onClick={handleConvert}>
            Convert to Invoice
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
              {quotation.items.map((item) => (
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
              <Typography variant="body2">₹{quotation.subtotal.toFixed(2)}</Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Discount</Typography>
              <Typography variant="body2">−₹{quotation.discountAmount.toFixed(2)}</Typography>
            </Stack>
            {company.isGstEnabled && (
              <>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">CGST</Typography>
                  <Typography variant="body2">₹{quotation.cgstAmount.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">SGST</Typography>
                  <Typography variant="body2">₹{quotation.sgstAmount.toFixed(2)}</Typography>
                </Stack>
              </>
            )}
            <Divider />
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Grand Total</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>₹{quotation.grandTotal.toFixed(2)}</Typography>
            </Stack>
          </Stack>

          {quotation.convertedInvoiceId && (
            <Button sx={{ mt: 2 }} onClick={() => navigate(`/app/invoices/${quotation.convertedInvoiceId}`)}>
              View converted invoice
            </Button>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
