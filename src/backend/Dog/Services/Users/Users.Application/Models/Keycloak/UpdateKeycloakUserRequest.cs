using Newtonsoft.Json;

namespace Users.Application.Models.Keycloak;

public class UpdateKeycloakUserRequest
{
    [JsonProperty("email")]
    public string? Email { get; set; }

    [JsonProperty("firstName")]
    public string? FirstName { get; set; }

    [JsonProperty("lastName")]
    public string? LastName { get; set; }

    [JsonProperty("enabled")]
    public bool? Enabled { get; set; }

    [JsonProperty("emailVerified")]
    public bool? EmailVerified { get; set; }

    [JsonProperty("attributes")]
    public Dictionary<string, string[]>? Attributes { get; set; }
}