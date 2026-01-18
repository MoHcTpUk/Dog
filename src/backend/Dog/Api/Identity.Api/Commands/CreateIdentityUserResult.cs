namespace Identity.Api.Commands;

public class CreateIdentityUserResult
{
    public string UserId { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
}