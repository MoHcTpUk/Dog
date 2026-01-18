using System.Security.Claims;
using Identity.Api.Commands;

namespace Identity.Api.Services;

public interface ITokenService
{
    Task<CreateClaimsPrincipalResult> CreateClaimsPrincipalForPasswordGrantAsync(
        CreateClaimsPrincipalForPasswordGrantCommand command);
    
    Task<CreateClaimsPrincipalResult> CreateClaimsPrincipalForRefreshTokenAsync(
        CreateClaimsPrincipalForRefreshTokenCommand command);
}
