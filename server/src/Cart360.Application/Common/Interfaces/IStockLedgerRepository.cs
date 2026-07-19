using Cart360.Domain.Entities.Inventory;

namespace Cart360.Application.Common.Interfaces;

public interface IStockLedgerRepository
{
    Task AddEntryAsync(StockLedgerEntry entry, CancellationToken cancellationToken = default);
}
