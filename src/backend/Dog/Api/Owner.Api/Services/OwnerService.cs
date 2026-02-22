using Owner.Api.Commands.Owner;
using Owner.Api.Dtos;
using Owner.Api.Queries;
using Shared.Api.Services;
using Shared.Messaging.Messaging;

namespace Owner.Api.Services;

public class OwnerService(ICommandBus commandBus)
    : Service<CreateOwnerCommand, UpdateOwnerCommand, DeleteOwnerCommand, OwnerQuery, OwnerDto>(commandBus),
        IOwnerService;
