using Shared.Messaging.Interfaces;

namespace Identity.Api.Commands;

public class GenerateTokenCommand : ICommand<GenerateTokenResult>
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public string Scope { get; set; } = "openid profile email";
}

public class GenerateTokenResult
{
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public string? TokenType { get; set; } = "Bearer";
    public int ExpiresIn { get; set; }
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
}
