using FluentValidation;

namespace Cart360.Application.Features.Expenses;

public class CreateExpenseCategoryRequestValidator : AbstractValidator<CreateExpenseCategoryRequest>
{
    public CreateExpenseCategoryRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
    }
}

public class CreateExpenseRequestValidator : AbstractValidator<CreateExpenseRequest>
{
    public CreateExpenseRequestValidator()
    {
        RuleFor(x => x.ExpenseCategoryId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
    }
}
