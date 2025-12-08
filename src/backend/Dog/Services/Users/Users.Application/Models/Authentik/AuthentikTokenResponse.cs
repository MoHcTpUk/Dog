using Newtonsoft.Json;

namespace Users.Application.Models.Authentik;

public class AuthentikTokenResponse
{
    [JsonProperty("access_token")]
    public string AccessToken { get; set; } = string.Empty;

    [JsonProperty("refresh_token")]
    public string? RefreshToken { get; set; }

    [JsonProperty("token_type")]
    public string TokenType { get; set; } = "Bearer";

    [JsonProperty("expires_in")]
    public int ExpiresIn { get; set; }

    [JsonProperty("scope")]
    public string? Scope { get; set; }
    
    [JsonProperty("id_token")]
    public string? IdToken { get; set; }
}

