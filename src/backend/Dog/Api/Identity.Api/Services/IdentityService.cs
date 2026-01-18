using Identity.Api.Commands;
using Shared.Messaging.Messaging;

namespace Identity.Api.Services;

public class IdentityService(ICommandBus commandBus) : IIdentityService
{
    private const string IdentityServiceSubject = "IdentityService";

    public async Task<CreateIdentityUserResult> CreateUserAsync(CreateIdentityUserCommand command)
    {
        var result = await commandBus.SendAsync<CreateIdentityUserCommand, CreateIdentityUserResult>(
            command, IdentityServiceSubject);

        return result ?? new CreateIdentityUserResult
        {
            Success = false,
            ErrorMessage = "No response from IdentityService"
        };
    }

    public async Task<GenerateTokenResult> GenerateTokenAsync(GenerateTokenCommand command)
    {
        var result = await commandBus.SendAsync<GenerateTokenCommand, GenerateTokenResult>(
            command, IdentityServiceSubject);

        return result ?? new GenerateTokenResult
        {
            Success = false,
            ErrorMessage = "No response from GatewayService"
        };
    }
}