using AutoMapper;
using Dog.Contracts.Commands.Owner;
using Dog.Contracts.Dtos;
using Dog.Domain;
using Dog.Domain.Aggregates;
using Shared.Application.Handlers;

namespace Dog.Application.Handlers.Owner;

public class CreateOwnerHandler(IOwnerRepository repository, IMapper mapper)
    : CreateAggregateHandler<OwnerAggregate, OwnerDto, CreateOwnerCommand>(repository, mapper);
