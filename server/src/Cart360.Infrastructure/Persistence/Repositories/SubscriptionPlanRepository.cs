using Cart360.Application.Common.Interfaces;
using Cart360.Domain.Entities.Platform;
using Microsoft.EntityFrameworkCore;

namespace Cart360.Infrastructure.Persistence.Repositories;

public class SubscriptionPlanRepository : ISubscriptionPlanRepository
{
    private readonly Cart360DbContext _db;

    public SubscriptionPlanRepository(Cart360DbContext db)
    {
        _db = db;
    }

    public Task<SubscriptionPlan?> GetByCodeAsync(string code, CancellationToken cancellationToken = default) =>
        _db.SubscriptionPlans.FirstOrDefaultAsync(p => p.Code == code, cancellationToken);

    public Task<SubscriptionPlan?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        _db.SubscriptionPlans.FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
}
