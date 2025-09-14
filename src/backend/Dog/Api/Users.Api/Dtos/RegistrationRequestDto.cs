using Shared.Dtos;

namespace Users.Api.Dtos;

public record RegistrationRequestDto : Dto
{
    public string Email { get; set; }

    public Guid Id { get; set; }
}