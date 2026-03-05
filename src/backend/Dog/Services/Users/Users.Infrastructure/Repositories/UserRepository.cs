using Shared.Infrastructure.Repository;
using Users.Application.Interfaces;
using Users.Domain.Aggregates;

namespace Users.Infrastructure.Repositories;

public class UserRepository(UserDbContext context)
    : AbstractRepository<UserAggregate, UserDbContext>(context), IUserRepository;