using Shared.Messaging.Interfaces;
using Users.Api.Dtos;

namespace Users.Api.Commands.RegistrationRequest;

public class VerifyRegistrationRequestCommand : ICommand<UserDto>
{
    public required Guid Id { get; set; }

    public required string VerificationCode { get; set; }
}