using Shared.Dtos;

namespace Users.Api.Dtos;

public record BearerTokenDto : Dto
{
    public required string AccessToken;

    public required int ExpiresIn;

    public required string RefreshToken;
}