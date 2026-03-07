using Shared.Messaging.Interfaces;

namespace Identity.Contracts.Commands;

public class SetIdentityUserPasswordCommand : ICommand<SetIdentityUserPasswordResult>
{
    public required string Email { get; set; }

    public required string Password { get; set; }
}
