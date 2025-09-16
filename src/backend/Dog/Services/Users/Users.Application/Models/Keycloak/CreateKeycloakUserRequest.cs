using Newtonsoft.Json;

namespace Users.Application.Models.Keycloak;

public class CreateKeycloakUserRequest
{
    [JsonProperty("username")]
    public string Username { get; set; } = string.Empty;

    [JsonProperty("email")]
    public string Email { get; set; }  = string.Empty;
    
    [JsonProperty("enabled")]
    public bool Enabled { get; set; } = true;
}