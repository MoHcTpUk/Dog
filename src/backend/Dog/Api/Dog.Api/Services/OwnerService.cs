using Dog.Api.Commands.Owner;
using Dog.Api.Dtos;
using Dog.Api.Queries;
using Shared.Api.Services;
using Shared.Messaging.Messaging;

namespace Dog.Api.Services;

public class OwnerService(ICommandBus commandBus)
    : Service<CreateOwnerCommand, UpdateOwnerCommand, DeleteOwnerCommand, OwnerQuery, OwnerDto>(commandBus),
        IOwnerService
{
    protected override string Subject => "DogService";
}