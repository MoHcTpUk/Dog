using Shared.Domain.Interfaces;
using Shared.Infrastructure.Repository;
using Users.Domain.Aggregates;

namespace Users.Infrastructure.Repositories;

public interface IRegistrationRequestRepository : IRepository<RegistrationRequest>;