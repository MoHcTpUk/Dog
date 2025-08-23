namespace Shared.Api.Commands;

public abstract class UpdateCommand<TResult> : Command<TResult>
{
    public Guid Id { get; set; }
}