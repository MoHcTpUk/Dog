using Shared.Messaging.Interfaces;

namespace Identity.Contracts.Commands;

public class CreateIdentityUserCommand : ICommand<CreateIdentityUserResult>
{
    public required string Email { get; set; }

    public required string UserName { get; set; }

    public required string Password { get; set; }
}
