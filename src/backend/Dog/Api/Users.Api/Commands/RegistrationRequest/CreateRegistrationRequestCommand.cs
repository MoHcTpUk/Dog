using Shared.Messaging.Interfaces;
using Users.Api.Dtos;

namespace Users.Api.Commands.RegistrationRequest;

public class CreateRegistrationRequestCommand : ICommand<RegistrationRequestDto>
{
    public required string Email { get; set; }
}