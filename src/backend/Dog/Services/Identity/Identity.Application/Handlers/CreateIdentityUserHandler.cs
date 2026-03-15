using Identity.Application.Services;
using Identity.Contracts.Commands;
using Shared.Messaging.Interfaces;

namespace Identity.Application.Handlers;

public class CreateIdentityUserHandler(
    IIdentityService identityService
) : ICommandHandler<CreateIdentityUserCommand, Guid>
{
    public async Task<Guid> Handle(CreateIdentityUserCommand request,
        CancellationToken cancellationToken)
    {
        var userId = await identityService.CreateUserAsync(
            request.Email,
            request.UserName,
            request.Password,
            cancellationToken);

        return userId;
    }
}