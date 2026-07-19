import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import {
  useGstReportQuery,
  useInventoryReportQuery,
  useOutstandingReportQuery,
  useProfitLossReportQuery,
  usePurchaseReportQuery,
  useSalesReportQuery,
  useTopProductsReportQuery
} from "../api/useReports";

const TABS = ["Sales", "Purchases", "GST", "Profit & Loss", "Top Products", "Inventory", "Outstanding"] as const;

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card sx={{ flex: 1, minWidth: 160, p: 2 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>{value}</Typography>
    </Card>
  );
}

export function ReportsPage() {
  const [tab, setTab] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const params = { from: from || undefined, to: to || undefined };

  const salesReport = useSalesReportQuery(params);
  const purchaseReport = usePurchaseReportQuery(params);
  const gstReport = useGstReportQuery(params);
  const profitLossReport = useProfitLossReportQuery(params);
  const topProductsReport = useTopProductsReportQuery(params);
  const inventoryReport = useInventoryReportQuery();
  const outstandingReport = useOutstandingReportQuery();

  const showDateRange = tab <= 4;

  return (
    <Stack spacing={2.5}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>Reports</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
        {TABS.map((label) => <Tab key={label} label={label} />)}
      </Tabs>

      {showDateRange && (
        <Stack direction="row" spacing={2}>
          <TextField label="From" type="date" size="small" value={from} onChange={(e) => setFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="To" type="date" size="small" value={to} onChange={(e) => setTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        </Stack>
      )}

      {tab === 0 && (
        <Stack spacing={2}>
          {salesReport.isLoading ? <CircularProgress size={24} /> : salesReport.data && (
            <>
              <Stack direction="row" spacing={2}>
                <StatCard label="Total Sales" value={`₹${salesReport.data.totalSales.toFixed(2)}`} />
                <StatCard label="Total Invoices" value={String(salesReport.data.totalInvoices)} />
              </Stack>
              <Card>
                <Table size="small">
                  <TableHead>
                    <TableRow><TableCell>Date</TableCell><TableCell align="right">Invoices</TableCell><TableCell align="right">Subtotal</TableCell><TableCell align="right">GST</TableCell><TableCell align="right">Grand Total</TableCell></TableRow>
                  </TableHead>
                  <TableBody>
                    {salesReport.data.rows.map((row) => (
                      <TableRow key={row.date}>
                        <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                        <TableCell align="right">{row.invoiceCount}</TableCell>
                        <TableCell align="right">₹{row.subtotal.toFixed(2)}</TableCell>
                        <TableCell align="right">₹{row.gstAmount.toFixed(2)}</TableCell>
                        <TableCell align="right">₹{row.grandTotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {salesReport.data.rows.length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>No sales in this range.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}
        </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          {purchaseReport.isLoading ? <CircularProgress size={24} /> : purchaseReport.data && (
            <>
              <Stack direction="row" spacing={2}>
                <StatCard label="Total Purchases" value={`₹${purchaseReport.data.totalPurchases.toFixed(2)}`} />
                <StatCard label="Total Purchase Bills" value={String(purchaseReport.data.totalPurchaseCount)} />
              </Stack>
              <Card>
                <Table size="small">
                  <TableHead>
                    <TableRow><TableCell>Date</TableCell><TableCell align="right">Purchases</TableCell><TableCell align="right">Subtotal</TableCell><TableCell align="right">GST</TableCell><TableCell align="right">Grand Total</TableCell></TableRow>
                  </TableHead>
                  <TableBody>
                    {purchaseReport.data.rows.map((row) => (
                      <TableRow key={row.date}>
                        <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                        <TableCell align="right">{row.purchaseCount}</TableCell>
                        <TableCell align="right">₹{row.subtotal.toFixed(2)}</TableCell>
                        <TableCell align="right">₹{row.gstAmount.toFixed(2)}</TableCell>
                        <TableCell align="right">₹{row.grandTotal.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {purchaseReport.data.rows.length === 0 && (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>No purchases in this range.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}
        </Stack>
      )}

      {tab === 2 && (
        <Stack spacing={2}>
          {gstReport.isLoading ? <CircularProgress size={24} /> : gstReport.data && (
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Output CGST" value={`₹${gstReport.data.outputCgst.toFixed(2)}`} /></Grid>
                  <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Output SGST" value={`₹${gstReport.data.outputSgst.toFixed(2)}`} /></Grid>
                  <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Input CGST" value={`₹${gstReport.data.inputCgst.toFixed(2)}`} /></Grid>
                  <Grid size={{ xs: 6, sm: 3 }}><StatCard label="Input SGST" value={`₹${gstReport.data.inputSgst.toFixed(2)}`} /></Grid>
                </Grid>
                <Typography variant="h6" sx={{ fontWeight: 800, mt: 2 }}>
                  Net GST Payable: ₹{gstReport.data.netGstPayable.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}

      {tab === 3 && (
        <Stack spacing={2}>
          {profitLossReport.isLoading ? <CircularProgress size={24} /> : profitLossReport.data && (
            <Card>
              <CardContent>
                <Stack spacing={1.25}>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}><Typography color="text.secondary">Sales Revenue</Typography><Typography>₹{profitLossReport.data.salesRevenue.toFixed(2)}</Typography></Stack>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}><Typography color="text.secondary">Other Income</Typography><Typography>₹{profitLossReport.data.otherIncome.toFixed(2)}</Typography></Stack>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}><Typography color="text.secondary">Cost of Goods Sold</Typography><Typography>−₹{profitLossReport.data.costOfGoodsSold.toFixed(2)}</Typography></Stack>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}><Typography sx={{ fontWeight: 700 }}>Gross Profit</Typography><Typography sx={{ fontWeight: 700 }}>₹{profitLossReport.data.grossProfit.toFixed(2)}</Typography></Stack>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}><Typography color="text.secondary">Expenses</Typography><Typography>−₹{profitLossReport.data.expenses.toFixed(2)}</Typography></Stack>
                  <Stack direction="row" sx={{ justifyContent: "space-between" }}><Typography variant="h6" sx={{ fontWeight: 800 }}>Net Profit</Typography><Typography variant="h6" sx={{ fontWeight: 800 }}>₹{profitLossReport.data.netProfit.toFixed(2)}</Typography></Stack>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}

      {tab === 4 && (
        <Card>
          <Table size="small">
            <TableHead>
              <TableRow><TableCell>Product</TableCell><TableCell align="right">Quantity Sold</TableCell><TableCell align="right">Revenue</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {topProductsReport.isLoading ? (
                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
              ) : (topProductsReport.data?.length ?? 0) === 0 ? (
                <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4, color: "text.secondary" }}>No sales data in this range.</TableCell></TableRow>
              ) : (
                topProductsReport.data?.map((row) => (
                  <TableRow key={row.productId}>
                    <TableCell>{row.productName}</TableCell>
                    <TableCell align="right">{row.quantitySold}</TableCell>
                    <TableCell align="right">₹{row.revenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {tab === 5 && (
        <Stack spacing={2}>
          {inventoryReport.data && (
            <Stack direction="row" spacing={2}>
              <StatCard label="Total Stock Value" value={`₹${inventoryReport.data.totalStockValue.toFixed(2)}`} />
              <StatCard label="Low Stock Products" value={String(inventoryReport.data.lowStockCount)} />
            </Stack>
          )}
          <Card>
            <Table size="small">
              <TableHead>
                <TableRow><TableCell>Product</TableCell><TableCell>SKU</TableCell><TableCell align="right">Current Stock</TableCell><TableCell align="right">Stock Value</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {inventoryReport.isLoading ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
                ) : (
                  inventoryReport.data?.rows.map((row) => (
                    <TableRow key={row.productId}>
                      <TableCell>{row.productName}</TableCell>
                      <TableCell>{row.sku}</TableCell>
                      <TableCell align="right">{row.currentStock}</TableCell>
                      <TableCell align="right">₹{row.stockValue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </Stack>
      )}

      {tab === 6 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Customers — Outstanding</Typography>
            <Card>
              <Table size="small">
                <TableHead><TableRow><TableCell>Customer</TableCell><TableCell align="right">Outstanding</TableCell></TableRow></TableHead>
                <TableBody>
                  {outstandingReport.isLoading ? (
                    <TableRow><TableCell colSpan={2} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
                  ) : (outstandingReport.data?.customers.length ?? 0) === 0 ? (
                    <TableRow><TableCell colSpan={2} align="center" sx={{ py: 4, color: "text.secondary" }}>No outstanding balances.</TableCell></TableRow>
                  ) : (
                    outstandingReport.data?.customers.map((row) => (
                      <TableRow key={row.partyId}><TableCell>{row.partyName}</TableCell><TableCell align="right">₹{row.outstandingAmount.toFixed(2)}</TableCell></TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Suppliers — Outstanding</Typography>
            <Card>
              <Table size="small">
                <TableHead><TableRow><TableCell>Supplier</TableCell><TableCell align="right">Outstanding</TableCell></TableRow></TableHead>
                <TableBody>
                  {outstandingReport.isLoading ? (
                    <TableRow><TableCell colSpan={2} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
                  ) : (outstandingReport.data?.suppliers.length ?? 0) === 0 ? (
                    <TableRow><TableCell colSpan={2} align="center" sx={{ py: 4, color: "text.secondary" }}>No outstanding balances.</TableCell></TableRow>
                  ) : (
                    outstandingReport.data?.suppliers.map((row) => (
                      <TableRow key={row.partyId}><TableCell>{row.partyName}</TableCell><TableCell align="right">₹{row.outstandingAmount.toFixed(2)}</TableCell></TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}
