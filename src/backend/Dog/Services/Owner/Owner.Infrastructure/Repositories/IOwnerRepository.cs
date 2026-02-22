using Owner.Domain.Aggregates;
using Shared.Infrastructure.Repository;

namespace Owner.Infrastructure.Repositories;

public interface IOwnerRepository : IRepository<OwnerAggregate>;
