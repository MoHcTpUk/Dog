using MediatR;

namespace Shared.Messaging.Interfaces;

public interface ICommandHandler<in TCommand, TResult> : IRequestHandler<TCommand, TResult>
    where TCommand : ICommand<TResult>
{
    Task<TResult> HandleAsync(TCommand command)
    {
        return Handle(command, CancellationToken.None);
    }
}

public interface ICommandHandler<in TCommand> : IRequestHandler<TCommand>
    where TCommand : ICommand
{
    Task HandleAsync(TCommand command)
    {
        return Handle(command, CancellationToken.None);
    }
}