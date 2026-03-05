using AutoMapper;
using Dog.Contracts.Commands.Owner;
using Dog.Contracts.Dtos;
using Dog.Domain;
using Dog.Domain.Aggregates;
using Shared.Application.Handlers;

namespace Dog.Application.Handlers.Owner;

public class UpdateOwnerHandler(IOwnerRepository repository, IMapper mapper)
    : UpdateAggregateHandler<OwnerAggregate, OwnerDto, UpdateOwnerCommand>(repository, mapper);
