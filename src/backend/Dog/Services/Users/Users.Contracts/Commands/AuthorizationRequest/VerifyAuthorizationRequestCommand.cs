using Shared.Messaging.Interfaces;
using Users.Contracts.Dtos;

namespace Users.Contracts.Commands.AuthorizationRequest;

public class VerifyAuthorizationRequestCommand : ICommand<UserDto>
{
    public required Guid Id { get; set; }

    public required string VerificationCode { get; set; }
}
