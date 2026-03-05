using Shared.Infrastructure.Repository;
using Users.Application.Interfaces;
using Users.Domain.Aggregates;

namespace Users.Infrastructure.Repositories;

public class RegistrationRequestRepository(UserDbContext context)
    : AbstractRepository<RegistrationRequest, UserDbContext>(context), IRegistrationRequestRepository;