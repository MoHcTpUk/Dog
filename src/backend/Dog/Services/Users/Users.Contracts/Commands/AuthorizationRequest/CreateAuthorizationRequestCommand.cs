using Shared.Messaging.Interfaces;
using Users.Contracts.Dtos;

namespace Users.Contracts.Commands.AuthorizationRequest;

public class CreateAuthorizationRequestCommand : ICommand<RegistrationRequestDto>
{
    public required string Email { get; set; }
}
