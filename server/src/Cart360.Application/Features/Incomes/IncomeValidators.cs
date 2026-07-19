using FluentValidation;

namespace Cart360.Application.Features.Incomes;

public class CreateIncomeCategoryRequestValidator : AbstractValidator<CreateIncomeCategoryRequest>
{
    public CreateIncomeCategoryRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
    }
}

public class CreateIncomeRequestValidator : AbstractValidator<CreateIncomeRequest>
{
    public CreateIncomeRequestValidator()
    {
        RuleFor(x => x.IncomeCategoryId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
    }
}
