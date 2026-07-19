using FluentValidation;

namespace Cart360.Application.Features.Products;

public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Sku).NotEmpty().MaximumLength(100);
        RuleFor(x => x.UnitId).NotEmpty();
        RuleFor(x => x.GstPercent).InclusiveBetween(0, 100);
        RuleFor(x => x.PurchasePrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.SellingPrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Mrp).GreaterThanOrEqualTo(0);
        RuleFor(x => x.OpeningStock).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MinStockLevel).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MaxStockLevel).GreaterThanOrEqualTo(x => x.MinStockLevel)
            .When(x => x.MaxStockLevel.HasValue)
            .WithMessage("Maximum stock level must be greater than or equal to the minimum stock level.");
    }
}

public class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Sku).NotEmpty().MaximumLength(100);
        RuleFor(x => x.UnitId).NotEmpty();
        RuleFor(x => x.GstPercent).InclusiveBetween(0, 100);
        RuleFor(x => x.PurchasePrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.SellingPrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Mrp).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MinStockLevel).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MaxStockLevel).GreaterThanOrEqualTo(x => x.MinStockLevel)
            .When(x => x.MaxStockLevel.HasValue)
            .WithMessage("Maximum stock level must be greater than or equal to the minimum stock level.");
    }
}
