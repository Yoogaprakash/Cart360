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
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { pdf } from "@react-pdf/renderer";
import { FiPrinter, FiXCircle, FiDollarSign, FiDownload } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { getErrorMessage } from "../../../lib/errorMessage";
import { useAuth } from "../../../store/AuthContext";
import { useMyCompanyQuery } from "../../company/api/useCompany";
import { InvoicePrintDocument, type PaperSize } from "../../../print/InvoicePrintDocument";
import { InvoicePdfDocument } from "../../../print/InvoicePdfDocument";
import { invoicesApi } from "../api/invoicesApi";
import { useCancelInvoice, useInvoiceQuery, useRecordInvoicePayment } from "../api/useInvoices";
import type { InvoiceStatus } from "../types";

const STATUS_COLOR: Record<InvoiceStatus, "default" | "warning" | "info" | "success" | "error"> = {
  Draft: "default", Pending: "warning", PartiallyPaid: "info", Paid: "success", Cancelled: "error"
};

const PAPER_SIZES: { label: string; value: PaperSize }[] = [
  { label: "A4", value: "A4" },
  { label: "Letter", value: "Letter" },
  { label: "Thermal 80mm", value: "Thermal80" },
  { label: "Thermal 58mm", value: "Thermal58" }
];

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const { data: invoice, isLoading } = useInvoiceQuery(id);
  const { data: company } = useMyCompanyQuery();
  const recordPayment = useRecordInvoicePayment();
  const cancelInvoice = useCancelInvoice();

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [printMenuAnchor, setPrintMenuAnchor] = useState<null | HTMLElement>(null);
  const [paperSize, setPaperSize] = useState<PaperSize>("A4");
  const [isDownloading, setIsDownloading] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const triggerPrint = useReactToPrint({ contentRef: printRef });

  if (isLoading || !invoice || !company) {
    return (
      <Stack sx={{ alignItems: "center", py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  const handleRecordPayment = async () => {
    setError(null);
    try {
      await recordPayment.mutateAsync({ id: invoice.id, amount: Number(paymentAmount) });
      setPaymentDialogOpen(false);
      setPaymentAmount("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handlePrint = async (size: PaperSize) => {
    setPaperSize(size);
    setPrintMenuAnchor(null);
    // Wait a tick so the hidden print document re-renders with the new paper size before printing.
    setTimeout(() => triggerPrint(), 0);
    try {
      await invoicesApi.registerPrint(invoice.id);
    } catch {
      // Non-critical — the print count is a soft usage metric, not worth failing the print over.
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const blob = await pdf(<InvoicePdfDocument invoice={invoice} company={company} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      await invoicesApi.registerPrint(invoice.id);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 800 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <Stack>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{invoice.invoiceNumber}</Typography>
          <Typography variant="body2" color="text.secondary">
            {invoice.customerName} · {new Date(invoice.invoiceDate).toLocaleDateString()}
          </Typography>
        </Stack>
        <Chip label={invoice.status} color={STATUS_COLOR[invoice.status]} />
      </Stack>

      <Stack direction="row" spacing={1.5}>
        {hasPermission("Invoices", "print") && (
          <>
            <Button variant="outlined" startIcon={<FiPrinter />} onClick={(e) => setPrintMenuAnchor(e.currentTarget)}>
              Print
            </Button>
            <Menu anchorEl={printMenuAnchor} open={Boolean(printMenuAnchor)} onClose={() => setPrintMenuAnchor(null)}>
              {PAPER_SIZES.map((p) => (
                <MenuItem key={p.value} onClick={() => handlePrint(p.value)}>{p.label}</MenuItem>
              ))}
            </Menu>
            <Button variant="outlined" startIcon={<FiDownload />} onClick={handleDownloadPdf} disabled={isDownloading}>
              {isDownloading ? "Preparing…" : "Download PDF"}
            </Button>
          </>
        )}
        {invoice.balanceAmount > 0 && invoice.status !== "Cancelled" && hasPermission("Invoices", "edit") && (
          <Button variant="outlined" startIcon={<FiDollarSign />} onClick={() => setPaymentDialogOpen(true)}>
            Record Payment
          </Button>
        )}
        {invoice.status !== "Cancelled" && hasPermission("Invoices", "delete") && (
          <Button variant="outlined" color="error" startIcon={<FiXCircle />} onClick={() => cancelInvoice.mutate(invoice.id)}>
            Cancel Invoice
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
              {invoice.items.map((item) => (
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
              <Typography variant="body2">₹{invoice.subtotal.toFixed(2)}</Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Discount</Typography>
              <Typography variant="body2">−₹{invoice.discountAmount.toFixed(2)}</Typography>
            </Stack>
            {company.isGstEnabled && (
              <>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">CGST</Typography>
                  <Typography variant="body2">₹{invoice.cgstAmount.toFixed(2)}</Typography>
                </Stack>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">SGST</Typography>
                  <Typography variant="body2">₹{invoice.sgstAmount.toFixed(2)}</Typography>
                </Stack>
              </>
            )}
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Round off</Typography>
              <Typography variant="body2">₹{invoice.roundOff.toFixed(2)}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Grand Total</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>₹{invoice.grandTotal.toFixed(2)}</Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Paid</Typography>
              <Typography variant="body2">₹{invoice.paidAmount.toFixed(2)}</Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="body2" color="error">Balance Due</Typography>
              <Typography variant="body2" color="error">₹{invoice.balanceAmount.toFixed(2)}</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <Typography variant="body2" color="text.secondary">Balance due: ₹{invoice.balanceAmount.toFixed(2)}</Typography>
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

      {/* Off-screen — react-to-print reads this node's DOM directly to build the print window. */}
      <div style={{ position: "fixed", top: 0, left: "-9999px" }}>
        <InvoicePrintDocument ref={printRef} invoice={invoice} company={company} paperSize={paperSize} />
      </div>
    </Stack>
  );
}
