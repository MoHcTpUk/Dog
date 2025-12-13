using Shared.Messaging.Interfaces;
using Users.Api.Dtos;

namespace Users.Api.Commands.RegistrationRequest;

public class VerifyRegistrationRequestCommand : ICommand<LoginUrlDto>
{
    public required string Id { get; set; }

    public required string VerificationCode { get; set; }
}