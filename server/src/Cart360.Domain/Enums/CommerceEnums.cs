namespace Cart360.Domain.Enums;

/// <summary>Payment method for non-invoice money movements (expenses, incomes, payments, receipts) — no "Credit" option.</summary>
public enum PaymentMethod
{
    Cash,
    UPI,
    Bank,
    Card
}

/// <summary>Invoice-specific payment method — includes "Credit" (bill now, collect later).</summary>
public enum InvoicePaymentMethod
{
    Cash,
    UPI,
    Bank,
    Card,
    Credit
}

public enum InvoiceStatus
{
    Draft,
    Pending,
    PartiallyPaid,
    Paid,
    Cancelled
}

public enum QuotationStatus
{
    Draft,
    Sent,
    Accepted,
    Rejected,
    Expired,
    Converted
}

public enum PurchaseStatus
{
    Draft,
    Received,
    Cancelled
}

/// <summary>Shared status for both sales returns and purchase returns.</summary>
public enum ReturnStatus
{
    Draft,
    Completed,
    Cancelled
}

public enum StockAdjustmentStatus
{
    Draft,
    Completed
}

public enum StockTransactionType
{
    OpeningStock,
    Purchase,
    Sale,
    PurchaseReturn,
    SalesReturn,
    Adjustment
}
