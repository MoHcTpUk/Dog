using Dog.Domain.Aggregates;
using Shared.Infrastructure.Repository;

namespace Dog.Infrastructure.Repositories;

public class OwnerRepository(DogDbContext context)
    : AbstractRepository<OwnerAggregate, DogDbContext>(context), IOwnerRepository;
