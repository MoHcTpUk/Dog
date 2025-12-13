using Shared.Dtos;

namespace Users.Api.Dtos;

public record LoginUrlDto : Dto
{
    public required string LoginUrl { get; set; }
}

