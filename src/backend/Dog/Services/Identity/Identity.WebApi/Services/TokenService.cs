using Identity.Api.Commands;
using Identity.Api.Services;
using MediatR;

namespace Identity.WebApi.Services;

// TODO странная хрень удалить
public class TokenService(IMediator mediator) : ITokenService
{
    public async Task<CreateClaimsPrincipalResult> CreateClaimsPrincipalForPasswordGrantAsync(
        CreateClaimsPrincipalForPasswordGrantCommand command)
    {
        var result = await mediator.Send(command);
        return result;
    }

    public async Task<CreateClaimsPrincipalResult> CreateClaimsPrincipalForRefreshTokenAsync(
        CreateClaimsPrincipalForRefreshTokenCommand command)
    {
        var result = await mediator.Send(command);
        return result;
    }
    
    public async Task<GenerateTokenResult> GenerateTokenAsync(GenerateTokenCommand command)
    {
        var result = await mediator.Send(command);
        return result;
    }
}
