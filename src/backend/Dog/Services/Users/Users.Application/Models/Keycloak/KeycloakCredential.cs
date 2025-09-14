using Newtonsoft.Json;

namespace Users.Application.Models.Keycloak;

public class KeycloakCredential
{
    [JsonProperty("id")]
    public string? Id { get; set; }

    [JsonProperty("type")]
    public string Type { get; set; } = "password";

    [JsonProperty("value")]
    public string? Value { get; set; }

    [JsonProperty("temporary")]
    public bool Temporary { get; set; } = false;
}