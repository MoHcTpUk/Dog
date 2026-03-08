using Shared.Infrastructure.Repository;
using Users.Application.Interfaces;
using Users.Domain.Aggregates;

namespace Users.Infrastructure.Repositories;

public class AuthRequestRepository(UserDbContext context)
    : AbstractRepository<AuthRequest, UserDbContext>(context), IAuthRequestRepository;