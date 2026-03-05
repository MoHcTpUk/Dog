using Dog.Contracts.Commands.Owner;
using Dog.Contracts.Dtos;
using Dog.Contracts.Queries;
using Shared.Api.Services;
using Shared.Messaging.Messaging;

namespace Dog.Api.Services;

public class OwnerService(ICommandBus commandBus)
    : Service<CreateOwnerCommand, UpdateOwnerCommand, DeleteOwnerCommand, OwnerQuery, OwnerDto>(commandBus),
        IOwnerService
{
    protected override string Subject => MessagingSubject.DogService;
}