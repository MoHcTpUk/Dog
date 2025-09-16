using Shared.Dtos;

namespace Users.Api.Dtos;

public record BearerTokenDto : Dto
{
    public required string AccessToken { get; set; }

    public required int ExpiresIn { get; set; }

    public required string RefreshToken { get; set; }
}