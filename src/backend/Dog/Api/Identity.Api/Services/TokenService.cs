using Identity.Api.Commands;
using Shared.Messaging.Messaging;

namespace Identity.Api.Services;

public class TokenService(ICommandBus commandBus) : ITokenService
{
    private const string IdentityServiceSubject = "IdentityService";

    public async Task<CreateClaimsPrincipalResult> CreateClaimsPrincipalForPasswordGrantAsync(
        CreateClaimsPrincipalForPasswordGrantCommand command)
    {
        var result = await commandBus.SendAsync<CreateClaimsPrincipalForPasswordGrantCommand, CreateClaimsPrincipalResult>(
            command, IdentityServiceSubject);

        return result ?? new CreateClaimsPrincipalResult
        {
            Success = false,
            ErrorMessage = "No response from IdentityService"
        };
    }

    public async Task<CreateClaimsPrincipalResult> CreateClaimsPrincipalForRefreshTokenAsync(
        CreateClaimsPrincipalForRefreshTokenCommand command)
    {
        var result = await commandBus.SendAsync<CreateClaimsPrincipalForRefreshTokenCommand, CreateClaimsPrincipalResult>(
            command, IdentityServiceSubject);

        return result ?? new CreateClaimsPrincipalResult
        {
            Success = false,
            ErrorMessage = "No response from IdentityService"
        };
    }
}
