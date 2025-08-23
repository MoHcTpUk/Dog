namespace Shared.Api.Commands;

public abstract class DeleteCommand<TResult> : Command<TResult>
{
    public Guid Id { get; set; }
}