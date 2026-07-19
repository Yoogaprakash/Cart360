using Cart360.Domain.Enums;

namespace Cart360.Application.Features.Expenses;

public record ExpenseCategoryDto(Guid Id, string Name, bool IsActive);
public record CreateExpenseCategoryRequest(string Name);

public record ExpenseDto(
    Guid Id, Guid ExpenseCategoryId, string ExpenseCategoryName, decimal Amount, DateOnly ExpenseDate,
    PaymentMethod PaymentMethod, string? ReferenceNumber, string? Notes, DateTimeOffset CreatedAt);

public record CreateExpenseRequest(Guid ExpenseCategoryId, decimal Amount, DateOnly ExpenseDate, PaymentMethod PaymentMethod, string? ReferenceNumber, string? Notes);
