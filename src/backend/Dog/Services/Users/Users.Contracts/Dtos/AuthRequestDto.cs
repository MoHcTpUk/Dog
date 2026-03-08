using Shared.Dtos;

namespace Users.Contracts.Dtos;

public record AuthRequestDto : Dto
{
    public required string Email { get; set; }

    public required Guid Id { get; set; }

    public required string VerificationCode { get; set; }

    [Obsolete("Use VerificationCode instead.")]
    public string ActivationCode
    {
        get => VerificationCode;
        set => VerificationCode = value;
    }
}
