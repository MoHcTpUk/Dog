using Dog.Domain.Aggregates;
using Shared.Domain.Interfaces;

namespace Dog.Domain;

public interface IOwnerRepository : IRepository<OwnerAggregate>;
