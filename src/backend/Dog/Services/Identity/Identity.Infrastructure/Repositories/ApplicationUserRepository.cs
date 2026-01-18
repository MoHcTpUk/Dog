using Microsoft.EntityFrameworkCore;
using Shared.Infrastructure.Repository;
using Identity.Domain.Aggregates;

namespace Identity.Infrastructure.Repositories;

public class ApplicationUserRepository(IdentityDbContext context)
    : AbstractRepository<ApplicationUser, IdentityDbContext>(context), IApplicationUserRepository
{
    public async Task<ApplicationUser?> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        return await context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<ApplicationUser?> GetByUserNameAsync(string userName, CancellationToken cancellationToken)
    {
        return await context.Users
            .FirstOrDefaultAsync(u => u.UserName == userName, cancellationToken);
    }
}
