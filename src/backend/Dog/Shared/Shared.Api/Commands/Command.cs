using Shared.Messaging.Interfaces;

namespace Shared.Api.Commands;

public abstract class Command<TResult> : ICommand<TResult>;