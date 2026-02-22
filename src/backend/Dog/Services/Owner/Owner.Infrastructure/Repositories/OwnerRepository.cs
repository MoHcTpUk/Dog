using Owner.Domain.Aggregates;
using Shared.Infrastructure.Repository;

namespace Owner.Infrastructure.Repositories;

public class OwnerRepository(OwnerDbContext context)
    : AbstractRepository<OwnerAggregate, OwnerDbContext>(context), IOwnerRepository;
