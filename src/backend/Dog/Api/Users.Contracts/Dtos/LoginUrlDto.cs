using Shared.Dtos;

namespace Users.Contracts.Dtos;

public record LoginUrlDto : Dto
{
    public string? AccessToken { get; set; }

    public string? RefreshToken { get; set; }
}
