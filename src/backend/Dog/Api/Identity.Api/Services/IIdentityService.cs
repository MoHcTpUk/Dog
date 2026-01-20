using Identity.Api.Commands;

namespace Identity.Api.Services;

public interface IIdentityService
{
    Task<CreateIdentityUserResult> CreateUserAsync(CreateIdentityUserCommand command);
    
    Task<GenerateTokenResult> GenerateTokenAsync(GenerateTokenCommand command);
}
