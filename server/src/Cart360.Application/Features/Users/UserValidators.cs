using FluentValidation;

namespace Cart360.Application.Features.Users;

public class InviteUserRequestValidator : AbstractValidator<InviteUserRequest>
{
    public InviteUserRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Role).Must(r => r == Domain.Enums.UserRole.Employee || r == Domain.Enums.UserRole.CompanyUser)
            .WithMessage("Only Employee or CompanyUser accounts can be invited.");
        RuleFor(x => x.TemporaryPassword)
            .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
            .Matches("[A-Za-z]").WithMessage("Password must contain at least one letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one digit.");
    }
}
