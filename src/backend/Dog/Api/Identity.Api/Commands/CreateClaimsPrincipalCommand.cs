using System.Security.Claims;
using Shared.Messaging.Interfaces;

namespace Identity.Api.Commands;

public class CreateClaimsPrincipalForPasswordGrantCommand : ICommand<CreateClaimsPrincipalResult>
{
    public required string Username { get; set; }
    public required string Password { get; set; }
    public IEnumerable<string> Scopes { get; set; } = [];
}

public class CreateClaimsPrincipalForRefreshTokenCommand : ICommand<CreateClaimsPrincipalResult>
{
    public required string RefreshToken { get; set; }
    public IEnumerable<string> RequestedScopes { get; set; } = [];
}

public class CreateClaimsPrincipalResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public string? Subject { get; set; }
    public string? Email { get; set; }
    public string? UserName { get; set; }
    public string? PreferredUsername { get; set; }
    public IEnumerable<string> Scopes { get; set; } = [];
    public string? TokenId { get; set; } // ID токена для отзыва (для refresh token)
}
