using Shared.Messaging.Interfaces;

namespace Shared.Messaging.Messaging;

public interface ICommandBus
{
    Task<TResult?> SendAsync<TCommand, TResult>(TCommand command, string subject)
        where TCommand : ICommand<TResult>;

    void RegisterHandler(string subject);
}