namespace Identity.Contracts.Commands;

public class CreateClaimsPrincipalResult
{
    public bool Success { get; set; }

    public string? ErrorMessage { get; set; }

    public string? Subject { get; set; }

    public string? Email { get; set; }

    public string? UserName { get; set; }

    public string? PreferredUsername { get; set; }

    public IEnumerable<string> Scopes { get; set; } = [];

    public string? TokenId { get; set; }
}
