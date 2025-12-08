using Newtonsoft.Json;

namespace Users.Application.Models.Authentik;

public class SetPasswordRequest
{
    [JsonProperty("password")]
    public string Password { get; set; } = string.Empty;
}

