using FluentValidation;

namespace Cart360.Application.Features.Invoices;

public class CreateInvoiceItemRequestValidator : AbstractValidator<CreateInvoiceItemRequest>
{
    public CreateInvoiceItemRequestValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0).When(x => x.UnitPrice.HasValue);
        RuleFor(x => x.DiscountPercent).InclusiveBetween(0, 100);
    }
}

public class CreateInvoiceRequestValidator : AbstractValidator<CreateInvoiceRequest>
{
    public CreateInvoiceRequestValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.PaidAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Items).NotEmpty().WithMessage("Add at least one line item.");
        RuleForEach(x => x.Items).SetValidator(new CreateInvoiceItemRequestValidator());
    }
}

public class RecordInvoicePaymentRequestValidator : AbstractValidator<RecordInvoicePaymentRequest>
{
    public RecordInvoicePaymentRequestValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0);
    }
}
