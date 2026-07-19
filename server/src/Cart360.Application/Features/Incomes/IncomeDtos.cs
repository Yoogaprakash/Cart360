using Cart360.Domain.Enums;

namespace Cart360.Application.Features.Incomes;

public record IncomeCategoryDto(Guid Id, string Name, bool IsActive);
public record CreateIncomeCategoryRequest(string Name);

public record IncomeDto(
    Guid Id, Guid IncomeCategoryId, string IncomeCategoryName, decimal Amount, DateOnly IncomeDate,
    string? Source, PaymentMethod PaymentMethod, string? Notes, DateTimeOffset CreatedAt);

public record CreateIncomeRequest(Guid IncomeCategoryId, decimal Amount, DateOnly IncomeDate, string? Source, PaymentMethod PaymentMethod, string? Notes);
