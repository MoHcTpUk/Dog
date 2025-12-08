using Newtonsoft.Json;

namespace Users.Application.Models.Authentik;

public class CreateAuthentikUserRequest
{
    [JsonProperty("username")]
    public string Username { get; set; } = string.Empty;

    [JsonProperty("email")]
    public string Email { get; set; } = string.Empty;

    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;

    [JsonProperty("is_active")]
    public bool IsActive { get; set; } = true;

    [JsonProperty("groups")]
    public List<string>? Groups { get; set; }

    [JsonProperty("path")]
    public string Path { get; set; } = "users";
}

