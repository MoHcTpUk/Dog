using Shared.Messaging.Interfaces;

namespace Identity.Contracts.Commands;

public class CreateClaimsPrincipalForPasswordGrantCommand : ICommand<CreateClaimsPrincipalResult>
{
    public required string Username { get; set; }

    public required string Password { get; set; }

    public IEnumerable<string> Scopes { get; set; } = [];
}
