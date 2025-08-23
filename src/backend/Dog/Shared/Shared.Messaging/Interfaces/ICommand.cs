using MediatR;

namespace Shared.Messaging.Interfaces;

public interface ICommand<out TResponse> : IRequest<TResponse>
{
}