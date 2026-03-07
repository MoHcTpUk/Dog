using Identity.Contracts.Commands;

namespace Identity.Contracts.Services;

public interface IIdentityService
{
    Task<CreateIdentityUserResult> CreateUserAsync(CreateIdentityUserCommand command);

    Task<SetIdentityUserPasswordResult> SetUserPasswordAsync(SetIdentityUserPasswordCommand command);

    Task<GenerateTokenResult> GenerateTokenAsync(GenerateTokenCommand command);
}
