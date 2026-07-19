using System.Net;
using Cart360.Application.Common.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Cart360.API.Middleware;

/// <summary>
/// Single place every unhandled exception funnels through. Maps known Application-layer
/// exceptions to the correct HTTP status + RFC 7807 ProblemDetails body; anything else is
/// logged with a correlation id and returned as an opaque 500 (never leaks stack traces).
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleAsync(context, ex);
        }
    }

    private async Task HandleAsync(HttpContext context, Exception exception)
    {
        var correlationId = context.TraceIdentifier;

        var (statusCode, title, errors) = exception switch
        {
            ValidationException validationEx => (
                HttpStatusCode.BadRequest,
                "One or more validation errors occurred.",
                validationEx.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray()) as IDictionary<string, string[]>),
            NotFoundException => (HttpStatusCode.NotFound, exception.Message, null),
            ConflictException => (HttpStatusCode.Conflict, exception.Message, null),
            ForbiddenAccessException => (HttpStatusCode.Forbidden, exception.Message, null),
            AuthenticationFailedException => (HttpStatusCode.Unauthorized, exception.Message, null),
            SubscriptionLimitExceededException => ((HttpStatusCode)402, exception.Message, null),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred.", null)
        };

        if (statusCode == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception. CorrelationId: {CorrelationId}", correlationId);
        }
        else
        {
            _logger.LogWarning(exception, "Handled exception ({StatusCode}). CorrelationId: {CorrelationId}", statusCode, correlationId);
        }

        var problemDetails = new ProblemDetails
        {
            Status = (int)statusCode,
            Title = title,
            Extensions = { ["correlationId"] = correlationId }
        };

        if (errors is not null)
            problemDetails.Extensions["errors"] = errors;

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)statusCode;
        await context.Response.WriteAsJsonAsync(problemDetails);
    }
}
