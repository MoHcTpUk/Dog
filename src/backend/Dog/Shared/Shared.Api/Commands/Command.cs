using Shared.Messaging.Interfaces;

namespace Shared.Api.Commands;

public abstract class Command<TResult> : ICommand<TResult>;

public abstract class Command : ICommand;