using Shared.Messaging.Interfaces;

namespace Identity.Contracts.Commands;

public class CreateClaimsPrincipalForRefreshTokenCommand : ICommand<CreateClaimsPrincipalResult>
{
    public required string RefreshToken { get; set; }

    public IEnumerable<string> RequestedScopes { get; set; } = [];
}
