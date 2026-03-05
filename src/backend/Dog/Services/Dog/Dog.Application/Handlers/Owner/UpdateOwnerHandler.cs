using AutoMapper;
using Dog.Api.Commands.Owner;
using Dog.Api.Dtos;
using Dog.Domain;
using Dog.Domain.Aggregates;
using Shared.Application.Handlers;

namespace Dog.Application.Handlers.Owner;

public class UpdateOwnerHandler(IOwnerRepository repository, IMapper mapper)
    : UpdateAggregateHandler<OwnerAggregate, OwnerDto, UpdateOwnerCommand>(repository, mapper);
