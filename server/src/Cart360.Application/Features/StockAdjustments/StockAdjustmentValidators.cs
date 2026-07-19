using FluentValidation;

namespace Cart360.Application.Features.StockAdjustments;

public class CreateStockAdjustmentRequestValidator : AbstractValidator<CreateStockAdjustmentRequest>
{
    public CreateStockAdjustmentRequestValidator()
    {
        RuleFor(x => x.Items).NotEmpty().WithMessage("Add at least one product to adjust.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).NotEmpty();
            item.RuleFor(i => i.ActualQuantity).GreaterThanOrEqualTo(0);
        });
    }
}
