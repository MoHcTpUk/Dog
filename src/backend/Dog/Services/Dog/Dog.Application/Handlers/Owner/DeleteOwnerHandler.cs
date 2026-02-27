using AutoMapper;
using Dog.Api.Commands.Owner;
using Dog.Api.Dtos;
using Dog.Domain.Aggregates;
using Dog.Infrastructure.Repositories;
using Shared.Application.Handlers;

namespace Dog.Application.Handlers.Owner;

public class DeleteOwnerHandler(IOwnerRepository repository, IMapper mapper)
    : DeleteAggregateHandler<OwnerAggregate, OwnerDto, DeleteOwnerCommand>(repository, mapper);
