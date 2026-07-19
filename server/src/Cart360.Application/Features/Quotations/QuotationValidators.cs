using FluentValidation;

namespace Cart360.Application.Features.Quotations;

public class CreateQuotationItemRequestValidator : AbstractValidator<CreateQuotationItemRequest>
{
    public CreateQuotationItemRequestValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0).When(x => x.UnitPrice.HasValue);
        RuleFor(x => x.DiscountPercent).InclusiveBetween(0, 100);
    }
}

public class CreateQuotationRequestValidator : AbstractValidator<CreateQuotationRequest>
{
    public CreateQuotationRequestValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty().WithMessage("Add at least one line item.");
        RuleForEach(x => x.Items).SetValidator(new CreateQuotationItemRequestValidator());
    }
}
