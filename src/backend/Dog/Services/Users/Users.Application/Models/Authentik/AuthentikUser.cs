using Newtonsoft.Json;

namespace Users.Application.Models.Authentik;

public class AuthentikUser
{
    [JsonProperty("pk")]
    public int Pk { get; set; }

    [JsonProperty("uid")]
    public string? Uid { get; set; }

    [JsonProperty("username")]
    public string Username { get; set; } = string.Empty;

    [JsonProperty("email")]
    public string? Email { get; set; }

    [JsonProperty("name")]
    public string? Name { get; set; }

    [JsonProperty("is_active")]
    public bool IsActive { get; set; } = true;

    [JsonProperty("is_superuser")]
    public bool IsSuperuser { get; set; } = false;

    [JsonProperty("groups")]
    public List<string>? Groups { get; set; }

    [JsonProperty("path")]
    public string Path { get; set; } = "users";

    [JsonProperty("last_login")]
    public DateTime? LastLogin { get; set; }

    [JsonProperty("date_joined")]
    public DateTime? DateJoined { get; set; }
}

