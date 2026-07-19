import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { Invoice } from "../features/invoices/types";
import type { CompanyDetail } from "../features/company/types";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#111111" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  logo: { maxHeight: 50, maxWidth: 150, marginBottom: 6, objectFit: "contain" },
  companyName: { fontSize: 16, fontWeight: 700 },
  muted: { color: "#666666", marginTop: 1 },
  right: { textAlign: "right" },
  invoiceTitle: { fontSize: 18, fontWeight: 700 },
  sectionTitle: { fontSize: 8, fontWeight: 700, textTransform: "uppercase", color: "#666666", marginTop: 14, marginBottom: 4, letterSpacing: 0.5 },
  table: { marginTop: 4 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eeeeee", paddingVertical: 5 },
  tableHeaderRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#333333", paddingBottom: 4 },
  colItem: { width: "40%" },
  colQty: { width: "12%", textAlign: "right" },
  colPrice: { width: "16%", textAlign: "right" },
  colGst: { width: "16%", textAlign: "right" },
  colTotal: { width: "16%", textAlign: "right" },
  totals: { marginTop: 10, marginLeft: "auto", width: 220 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  grandTotalRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#333333", marginTop: 4, paddingTop: 4 },
  grandTotalText: { fontWeight: 700, fontSize: 12 }
});

const money = (n: number) => `Rs. ${n.toFixed(2)}`;

interface InvoicePdfDocumentProps {
  invoice: Invoice;
  company: CompanyDetail;
}

export function InvoicePdfDocument({ invoice, company }: InvoicePdfDocumentProps) {
  const showGst = company.isGstEnabled;

  return (
    <Document title={`${invoice.invoiceNumber} - ${company.name}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {company.logoUrl && <Image src={company.logoUrl} style={styles.logo} />}
            <Text style={styles.companyName}>{company.name}</Text>
            {company.addressLine1 && <Text style={styles.muted}>{company.addressLine1}</Text>}
            {company.addressLine2 && <Text style={styles.muted}>{company.addressLine2}</Text>}
            <Text style={styles.muted}>{[company.city, company.state, company.postalCode].filter(Boolean).join(", ")}</Text>
            {company.phone && <Text style={styles.muted}>Phone: {company.phone}</Text>}
            {showGst && company.gstNumber && <Text style={styles.muted}>GSTIN: {company.gstNumber}</Text>}
          </View>
          <View style={styles.right}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text>{invoice.invoiceNumber}</Text>
            <Text style={styles.muted}>Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</Text>
            {invoice.dueDate && <Text style={styles.muted}>Due: {new Date(invoice.dueDate).toLocaleDateString()}</Text>}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Bill To</Text>
        <Text style={{ fontWeight: 700 }}>{invoice.customerName}</Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.colItem}>Item</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Price</Text>
            {showGst && <Text style={styles.colGst}>GST</Text>}
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colItem}>{item.productName}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{money(item.unitPrice)}</Text>
              {showGst && <Text style={styles.colGst}>{money(item.cgstAmount + item.sgstAmount)}</Text>}
              <Text style={styles.colTotal}>{money(item.totalAmount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}><Text>Subtotal</Text><Text>{money(invoice.subtotal)}</Text></View>
          {invoice.discountAmount > 0 && (
            <View style={styles.totalsRow}><Text>Discount</Text><Text>-{money(invoice.discountAmount)}</Text></View>
          )}
          {showGst && <View style={styles.totalsRow}><Text>CGST</Text><Text>{money(invoice.cgstAmount)}</Text></View>}
          {showGst && <View style={styles.totalsRow}><Text>SGST</Text><Text>{money(invoice.sgstAmount)}</Text></View>}
          {invoice.roundOff !== 0 && (
            <View style={styles.totalsRow}><Text>Round off</Text><Text>{money(invoice.roundOff)}</Text></View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalText}>Grand Total</Text>
            <Text style={styles.grandTotalText}>{money(invoice.grandTotal)}</Text>
          </View>
          <View style={styles.totalsRow}><Text>Paid</Text><Text>{money(invoice.paidAmount)}</Text></View>
          <View style={styles.totalsRow}><Text>Balance Due</Text><Text>{money(invoice.balanceAmount)}</Text></View>
        </View>

        {(company.bankName || company.upiId) && (
          <>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            {company.bankName && (
              <Text style={styles.muted}>{company.bankName} - {company.bankAccountNumber} - IFSC {company.bankIfsc}</Text>
            )}
            {company.upiId && <Text style={styles.muted}>UPI: {company.upiId}</Text>}
          </>
        )}

        {invoice.notes && (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.muted}>{invoice.notes}</Text>
          </>
        )}

        {(invoice.terms || company.termsAndConditions) && (
          <>
            <Text style={styles.sectionTitle}>Terms &amp; Conditions</Text>
            <Text style={styles.muted}>{invoice.terms || company.termsAndConditions}</Text>
          </>
        )}
      </Page>
    </Document>
  );
}
