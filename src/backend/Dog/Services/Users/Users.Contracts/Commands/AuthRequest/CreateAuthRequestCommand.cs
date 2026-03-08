using Shared.Messaging.Interfaces;
using Users.Contracts.Dtos;

namespace Users.Contracts.Commands.AuthRequest;

public class CreateAuthRequestCommand : ICommand<AuthRequestDto>
{
    public required string Email { get; set; }
}
