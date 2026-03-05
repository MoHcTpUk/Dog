using Dog.Domain.Aggregates;
using Shared.Domain.Interfaces;

namespace Dog.Domain;

public interface IDogRepository : IRepository<DogAggregate>;
