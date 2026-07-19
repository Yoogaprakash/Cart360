namespace Cart360.Application.Common.Exceptions;

/// <summary>Requested entity does not exist (or is invisible to the caller's tenant) → HTTP 404.</summary>
public class NotFoundException : Exception
{
    public NotFoundException(string entityName, object key)
        : base($"{entityName} with id '{key}' was not found.") { }

    public NotFoundException(string message) : base(message) { }
}

/// <summary>The request conflicts with current state (duplicate code/number, already-converted quotation, ...) → HTTP 409.</summary>
public class ConflictException : Exception
{
    public ConflictException(string message) : base(message) { }
}

/// <summary>Caller is authenticated but not allowed to perform this action (role/permission/tenant mismatch) → HTTP 403.</summary>
public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException(string message = "You do not have permission to perform this action.") : base(message) { }
}

/// <summary>Authentication failed (bad credentials, expired/revoked token, unverified email, ...) → HTTP 401.</summary>
public class AuthenticationFailedException : Exception
{
    public AuthenticationFailedException(string message) : base(message) { }
}

/// <summary>The tenant's current subscription plan cannot accommodate this action → HTTP 402.</summary>
public class SubscriptionLimitExceededException : Exception
{
    public string LimitType { get; }

    public SubscriptionLimitExceededException(string limitType, int max)
        : base($"Your current plan allows a maximum of {max} {limitType}. Upgrade your plan to continue.")
    {
        LimitType = limitType;
    }
}
