using AutoMapper;
using Owner.Api.Commands.Owner;
using Owner.Api.Dtos;
using Owner.Domain.Aggregates;
using Owner.Infrastructure.Repositories;
using Shared.Application.Handlers;

namespace Owner.Application.Handlers;

public class DeleteOwnerHandler(IOwnerRepository repository, IMapper mapper)
    : DeleteAggregateHandler<OwnerAggregate, OwnerDto, DeleteOwnerCommand>(repository, mapper);
