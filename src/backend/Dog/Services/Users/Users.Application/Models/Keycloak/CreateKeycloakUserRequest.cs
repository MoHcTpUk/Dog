using Newtonsoft.Json;

namespace Users.Application.Models.Keycloak;

public class CreateKeycloakUserRequest
{
    [JsonProperty("username")]
    public string Username { get; set; } = string.Empty;

    [JsonProperty("email")]
    public string? Email { get; set; }

    [JsonProperty("firstName")]
    public string? FirstName { get; set; }

    [JsonProperty("lastName")]
    public string? LastName { get; set; }

    [JsonProperty("enabled")]
    public bool Enabled { get; set; } = true;

    [JsonProperty("emailVerified")]
    public bool EmailVerified { get; set; } = false;

    [JsonProperty("credentials")]
    public List<KeycloakCredential>? Credentials { get; set; }

    [JsonProperty("attributes")]
    public Dictionary<string, string[]>? Attributes { get; set; }
}