using FluentValidation;

namespace Cart360.Application.Features.SuperAdmin;

public class UpsertSubscriptionPlanRequestValidator : AbstractValidator<UpsertSubscriptionPlanRequest>
{
    public UpsertSubscriptionPlanRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.MonthlyPrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.YearlyPrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MaxUsers).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MaxProducts).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MaxCustomers).GreaterThanOrEqualTo(0);
    }
}
