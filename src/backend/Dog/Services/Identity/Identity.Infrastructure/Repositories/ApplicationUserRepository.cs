using Identity.Domain.Aggregates;
using Microsoft.EntityFrameworkCore;
using Shared.Infrastructure.Repository;

namespace Identity.Infrastructure.Repositories;

public class ApplicationUserRepository(IdentityDbContext context)
    : AbstractRepository<ApplicationUser, IdentityDbContext>(context), IApplicationUserRepository
{
    private readonly IdentityDbContext _context = context;

    public async Task<ApplicationUser?> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<ApplicationUser?> GetByUserNameAsync(string userName, CancellationToken cancellationToken)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.UserName == userName, cancellationToken);
    }
}