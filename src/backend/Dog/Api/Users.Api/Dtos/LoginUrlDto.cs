using Shared.Dtos;

namespace Users.Api.Dtos;

public record LoginUrlDto : Dto
{
    public string? AccessToken { get; set; }
}

