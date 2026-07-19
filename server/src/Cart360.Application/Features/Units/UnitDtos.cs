namespace Cart360.Application.Features.Units;

public record UnitDto(Guid Id, string Name, string ShortCode, bool IsActive);

public record CreateUnitRequest(string Name, string ShortCode);

public record UpdateUnitRequest(string Name, string ShortCode, bool IsActive);
