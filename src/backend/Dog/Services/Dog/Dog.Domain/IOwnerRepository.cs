using Dog.Domain.Aggregates;
using Shared.Domain.Interfaces;
using Shared.Infrastructure.Repository;

namespace Dog.Infrastructure.Repositories;

public interface IOwnerRepository : IRepository<OwnerAggregate>;
