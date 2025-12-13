namespace Users.Application.Models.Authentik;

public class AuthentikConfiguration
{
    public string BaseUrl { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string ApiToken { get; set; } = string.Empty;
    public string RedirectUri { get; set; } = string.Empty;
}

