using FluentValidation;

namespace Cart360.Application.Features.Returns;

public class CreateSalesReturnRequestValidator : AbstractValidator<CreateSalesReturnRequest>
{
    public CreateSalesReturnRequestValidator()
    {
        RuleFor(x => x.InvoiceId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty().WithMessage("Add at least one item to return.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.InvoiceItemId).NotEmpty();
            item.RuleFor(i => i.Quantity).GreaterThan(0);
        });
    }
}

public class CreatePurchaseReturnRequestValidator : AbstractValidator<CreatePurchaseReturnRequest>
{
    public CreatePurchaseReturnRequestValidator()
    {
        RuleFor(x => x.PurchaseId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty().WithMessage("Add at least one item to return.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.PurchaseItemId).NotEmpty();
            item.RuleFor(i => i.Quantity).GreaterThan(0);
        });
    }
}
