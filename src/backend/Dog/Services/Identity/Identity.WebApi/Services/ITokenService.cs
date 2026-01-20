using Identity.Api.Commands;

namespace Identity.WebApi.Services;

public interface ITokenService
{
    Task<CreateClaimsPrincipalResult> CreateClaimsPrincipalForPasswordGrantAsync(
        CreateClaimsPrincipalForPasswordGrantCommand command);

    Task<CreateClaimsPrincipalResult> CreateClaimsPrincipalForRefreshTokenAsync(
        CreateClaimsPrincipalForRefreshTokenCommand command);

    Task<GenerateTokenResult> GenerateTokenAsync(GenerateTokenCommand command);
}