namespace Identity.Contracts.Commands;

public class GenerateTokenResult
{
    public string? AccessToken { get; set; }

    public string? RefreshToken { get; set; }

    public string? TokenType { get; set; } = "Bearer";

    public int ExpiresIn { get; set; }

    public bool Success { get; set; }

    public string? ErrorMessage { get; set; }
}
