using Shared.Dtos;

namespace Users.Contracts.Dtos;

public record RegistrationRequestDto : Dto
{
    public required string Email { get; set; }

    public required Guid Id { get; set; }

    [Obsolete("Used for backward compatibility")]
    public required string ActivationCode { get; set; }
}
