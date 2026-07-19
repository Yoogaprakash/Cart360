using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Cart360.API.Filters;

/// <summary>
/// Runs the registered FluentValidation validator (if any) for every action argument before
/// the action executes, throwing <see cref="ValidationException"/> on failure — which
/// <see cref="Cart360.API.Middleware.GlobalExceptionMiddleware"/> maps to a 400 ProblemDetails
/// response. Replaces the old (now-unmaintained) FluentValidation.AspNetCore auto-validation package.
/// </summary>
public class ValidationActionFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argument in context.ActionArguments.Values)
        {
            if (argument is null) continue;

            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
            if (context.HttpContext.RequestServices.GetService(validatorType) is not IValidator validator)
                continue;

            var validationContext = new ValidationContext<object>(argument);
            var result = await validator.ValidateAsync(validationContext);
            if (!result.IsValid)
                throw new ValidationException(result.Errors);
        }

        await next();
    }
}
