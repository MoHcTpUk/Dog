using Dog.Domain;
using Dog.Domain.Aggregates;
using Shared.Infrastructure.Repository;

namespace Dog.Infrastructure.Repositories;

public class DogRepository(DogDbContext context)
    : AbstractRepository<DogAggregate, DogDbContext>(context), IDogRepository;
