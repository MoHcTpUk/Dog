using Identity.Contracts.Commands;
using Identity.Application.Services;
using Shared.Messaging.Interfaces;

namespace Identity.Application.Handlers;

public class CreateIdentityUserHandler(
    IIdentityService identityService
) : ICommandHandler<CreateIdentityUserCommand, CreateIdentityUserResult>
{
    public async Task<CreateIdentityUserResult> Handle(CreateIdentityUserCommand request,
        CancellationToken cancellationToken)
    {
        var userId = await identityService.CreateUserAsync(
            request.Email,
            request.UserName,
            request.Password,
            cancellationToken);

        return new CreateIdentityUserResult
        {
            UserId = userId,
            Success = true
        };
    }
}