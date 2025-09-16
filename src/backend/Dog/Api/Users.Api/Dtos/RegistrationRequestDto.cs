using Shared.Dtos;

namespace Users.Api.Dtos;

public record RegistrationRequestDto : Dto
{
    public required string Email { get; set; }

    public required Guid Id { get; set; }

    [Obsolete]
    public required string ActivationCode { get; set; }
}