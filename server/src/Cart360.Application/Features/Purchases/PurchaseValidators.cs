using FluentValidation;

namespace Cart360.Application.Features.Purchases;

public class CreatePurchaseItemRequestValidator : AbstractValidator<CreatePurchaseItemRequest>
{
    public CreatePurchaseItemRequestValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.DiscountPercent).InclusiveBetween(0, 100);
    }
}

public class CreatePurchaseRequestValidator : AbstractValidator<CreatePurchaseRequest>
{
    public CreatePurchaseRequestValidator()
    {
        RuleFor(x => x.SupplierId).NotEmpty();
        RuleFor(x => x.PaidAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Items).NotEmpty().WithMessage("Add at least one line item.");
        RuleForEach(x => x.Items).SetValidator(new CreatePurchaseItemRequestValidator());
    }
}

public class RecordPurchasePaymentRequestValidator : AbstractValidator<RecordPurchasePaymentRequest>
{
    public RecordPurchasePaymentRequestValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0);
    }
}
