using Shared.Messaging.Interfaces;
using Users.Contracts.Dtos;

namespace Users.Contracts.Commands.RegistrationRequest;

public class CreateRegistrationRequestCommand : ICommand<RegistrationRequestDto>
{
    public required string Email { get; set; }
}
