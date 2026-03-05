using Shared.Messaging.Interfaces;

namespace Identity.Contracts.Commands;

public class GenerateTokenCommand : ICommand<GenerateTokenResult>
{
    public required string Email { get; set; }

    public required string Password { get; set; }

    public string Scope { get; set; } = "openid profile email";
}
