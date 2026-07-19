using FluentValidation;

namespace Cart360.Application.Features.Tenants;

public class UpdateCompanySettingsRequestValidator : AbstractValidator<UpdateCompanySettingsRequest>
{
    public UpdateCompanySettingsRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.GstNumber).MaximumLength(20);
        RuleFor(x => x.PanNumber).MaximumLength(20);
        RuleFor(x => x.Phone).MaximumLength(20);
        RuleFor(x => x.InvoicePrefix).NotEmpty().MaximumLength(20);
        RuleFor(x => x.QuotationPrefix).NotEmpty().MaximumLength(20);
        RuleFor(x => x.PurchasePrefix).NotEmpty().MaximumLength(20);
        RuleFor(x => x.ThemeColor).NotEmpty().Matches("^#[0-9A-Fa-f]{6}$").WithMessage("Theme color must be a hex color like #6366F1.");
        RuleFor(x => x.Currency).NotEmpty().Length(3);
        RuleFor(x => x.Language).NotEmpty().MaximumLength(10);
    }
}

public class SuspendCompanyRequestValidator : AbstractValidator<SuspendCompanyRequest>
{
    public SuspendCompanyRequestValidator()
    {
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
    }
}

public class RejectCompanyRequestValidator : AbstractValidator<RejectCompanyRequest>
{
    public RejectCompanyRequestValidator()
    {
        RuleFor(x => x.Reason).NotEmpty().MaximumLength(500);
    }
}
