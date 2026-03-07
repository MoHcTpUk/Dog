namespace Identity.Contracts.Commands;

public class SetIdentityUserPasswordResult
{
    public bool Success { get; set; }

    public string? ErrorMessage { get; set; }
}
