import { forwardRef } from "react";
import type { Invoice } from "../features/invoices/types";
import type { CompanyDetail } from "../features/company/types";

export type PaperSize = "A4" | "Thermal80" | "Thermal58" | "Letter";

interface InvoicePrintDocumentProps {
  invoice: Invoice;
  company: CompanyDetail;
  paperSize: PaperSize;
}

const PAGE_CSS: Record<PaperSize, string> = {
  A4: "size: A4 portrait; margin: 14mm;",
  Letter: "size: letter portrait; margin: 14mm;",
  Thermal80: "size: 80mm auto; margin: 3mm;",
  Thermal58: "size: 58mm auto; margin: 2mm;"
};

const money = (n: number) => `₹${n.toFixed(2)}`;

/**
 * A single template that adapts to A4/Letter (full tabular layout) or thermal
 * receipt widths (condensed, larger tap-friendly text, no wide columns) via
 * the `paperSize` prop — rather than three near-duplicate components.
 */
export const InvoicePrintDocument = forwardRef<HTMLDivElement, InvoicePrintDocumentProps>(function InvoicePrintDocument(
  { invoice, company, paperSize },
  ref
) {
  const isThermal = paperSize === "Thermal80" || paperSize === "Thermal58";
  const showGst = company.isGstEnabled;

  return (
    <div ref={ref} className={`invoice-print invoice-print--${paperSize.toLowerCase()}`}>
      <style>{`
        @page { ${PAGE_CSS[paperSize]} }
        .invoice-print {
          font-family: "Segoe UI", Arial, sans-serif;
          color: #111;
          width: ${isThermal ? "100%" : "auto"};
          font-size: ${paperSize === "Thermal58" ? "10px" : isThermal ? "11px" : "13px"};
        }
        .invoice-print table { width: 100%; border-collapse: collapse; }
        .invoice-print th, .invoice-print td { padding: ${isThermal ? "3px 2px" : "6px 8px"}; text-align: left; }
        .invoice-print thead th { border-bottom: 1px solid #333; font-size: 0.9em; }
        .invoice-print tbody td { border-bottom: ${isThermal ? "none" : "1px solid #eee"}; }
        .invoice-print .right { text-align: right; }
        .invoice-print .center { text-align: center; }
        .invoice-print .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: ${isThermal ? "8px" : "16px"}; }
        .invoice-print .logo { max-height: ${isThermal ? "36px" : "56px"}; max-width: 100%; }
        .invoice-print .totals { margin-top: 8px; margin-left: auto; width: ${isThermal ? "100%" : "260px"}; }
        .invoice-print .totals div { display: flex; justify-content: space-between; padding: 2px 0; }
        .invoice-print .grand-total { font-weight: 700; font-size: 1.15em; border-top: 1px solid #333; margin-top: 4px; padding-top: 4px !important; }
        .invoice-print .section-title { font-weight: 700; text-transform: uppercase; font-size: 0.8em; letter-spacing: 0.5px; color: #666; margin-top: ${isThermal ? "8px" : "16px"}; margin-bottom: 4px; }
        .invoice-print .company-name { font-weight: 800; font-size: ${isThermal ? "1.1em" : "1.4em"}; }
        .invoice-print .muted { color: #666; }
        @media print { .invoice-print { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      `}</style>

      <div className="header">
        <div>
          {company.logoUrl && <img src={company.logoUrl} alt={company.name} className="logo" />}
          <div className="company-name">{company.name}</div>
          {company.addressLine1 && <div className="muted">{company.addressLine1}</div>}
          {company.addressLine2 && <div className="muted">{company.addressLine2}</div>}
          <div className="muted">{[company.city, company.state, company.postalCode].filter(Boolean).join(", ")}</div>
          {company.phone && <div className="muted">Phone: {company.phone}</div>}
          {showGst && company.gstNumber && <div className="muted">GSTIN: {company.gstNumber}</div>}
        </div>
        {!isThermal && (
          <div className="right">
            <div style={{ fontWeight: 700, fontSize: "1.3em" }}>INVOICE</div>
            <div>{invoice.invoiceNumber}</div>
            <div className="muted">Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</div>
            {invoice.dueDate && <div className="muted">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>}
          </div>
        )}
      </div>

      {isThermal && (
        <div className="center" style={{ marginBottom: 6 }}>
          <div style={{ fontWeight: 700 }}>{invoice.invoiceNumber}</div>
          <div className="muted">{new Date(invoice.invoiceDate).toLocaleDateString()}</div>
        </div>
      )}

      <div className="section-title">Bill To</div>
      <div style={{ fontWeight: 600 }}>{invoice.customerName}</div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th className="right">Qty</th>
            <th className="right">Price</th>
            {showGst && !isThermal && <th className="right">GST</th>}
            <th className="right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id}>
              <td>{item.productName}</td>
              <td className="right">{item.quantity}</td>
              <td className="right">{money(item.unitPrice)}</td>
              {showGst && !isThermal && <td className="right">{money(item.cgstAmount + item.sgstAmount)}</td>}
              <td className="right">{money(item.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="totals">
        <div><span>Subtotal</span><span>{money(invoice.subtotal)}</span></div>
        {invoice.discountAmount > 0 && <div><span>Discount</span><span>−{money(invoice.discountAmount)}</span></div>}
        {showGst && <div><span>CGST</span><span>{money(invoice.cgstAmount)}</span></div>}
        {showGst && <div><span>SGST</span><span>{money(invoice.sgstAmount)}</span></div>}
        {invoice.roundOff !== 0 && <div><span>Round off</span><span>{money(invoice.roundOff)}</span></div>}
        <div className="grand-total"><span>Grand Total</span><span>{money(invoice.grandTotal)}</span></div>
        <div><span>Paid</span><span>{money(invoice.paidAmount)}</span></div>
        <div><span>Balance Due</span><span>{money(invoice.balanceAmount)}</span></div>
      </div>

      {(company.bankName || company.upiId) && (
        <>
          <div className="section-title">Payment Details</div>
          {company.bankName && <div className="muted">{company.bankName} · {company.bankAccountNumber} · IFSC {company.bankIfsc}</div>}
          {company.upiId && <div className="muted">UPI: {company.upiId}</div>}
          {!isThermal && company.upiQrUrl && <img src={company.upiQrUrl} alt="UPI QR" style={{ height: 90, marginTop: 6 }} />}
        </>
      )}

      {invoice.notes && (
        <>
          <div className="section-title">Notes</div>
          <div className="muted">{invoice.notes}</div>
        </>
      )}

      {(invoice.terms || company.termsAndConditions) && (
        <>
          <div className="section-title">Terms &amp; Conditions</div>
          <div className="muted" style={{ whiteSpace: "pre-line" }}>{invoice.terms || company.termsAndConditions}</div>
        </>
      )}

      {!isThermal && company.signatureUrl && (
        <div className="right" style={{ marginTop: 24 }}>
          <img src={company.signatureUrl} alt="Signature" style={{ height: 50 }} />
          <div className="muted">Authorized Signatory</div>
        </div>
      )}
    </div>
  );
});
