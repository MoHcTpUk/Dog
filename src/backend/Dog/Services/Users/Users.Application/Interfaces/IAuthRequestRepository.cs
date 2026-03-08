using Shared.Domain.Interfaces;
using Users.Domain.Aggregates;

namespace Users.Application.Interfaces;

public interface IAuthRequestRepository : IRepository<AuthRequest>;