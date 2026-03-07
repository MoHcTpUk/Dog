using Identity.Application.Services;
using Identity.Contracts.Commands;
using Shared.Messaging.Interfaces;

namespace Identity.Application.Handlers;

public class SetIdentityUserPasswordHandler(
    IIdentityService identityService
) : ICommandHandler<SetIdentityUserPasswordCommand, SetIdentityUserPasswordResult>
{
    public async Task<SetIdentityUserPasswordResult> Handle(SetIdentityUserPasswordCommand request,
        CancellationToken cancellationToken)
    {
        await identityService.SetUserPasswordAsync(
            request.Email,
            request.Password,
            cancellationToken);

        return new SetIdentityUserPasswordResult
        {
            Success = true
        };
    }
}
