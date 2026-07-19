using Cart360.Application.Common.Interfaces;
using Cart360.Domain.Entities.Inventory;

namespace Cart360.Infrastructure.Persistence.Repositories;

public class StockLedgerRepository : IStockLedgerRepository
{
    private readonly Cart360DbContext _db;

    public StockLedgerRepository(Cart360DbContext db)
    {
        _db = db;
    }

    public async Task AddEntryAsync(StockLedgerEntry entry, CancellationToken cancellationToken = default) =>
        await _db.StockLedgerEntries.AddAsync(entry, cancellationToken);
}
