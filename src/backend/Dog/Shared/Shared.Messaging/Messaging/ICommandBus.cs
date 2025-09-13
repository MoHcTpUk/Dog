using Shared.Messaging.Interfaces;

namespace Shared.Messaging.Messaging;

public interface ICommandBus
{
    Task<TResult?> SendAsync<TCommand, TResult>(TCommand command, string subject)
        where TCommand : ICommand<TResult>;

    void SendAsync<TCommand>(TCommand command, string subject)
        where TCommand : ICommand;

    void RegisterHandler(string subject);
}