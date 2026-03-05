using AutoMapper;
using Dog.Contracts.Commands.Dog;
using Dog.Contracts.Dtos;
using Dog.Domain;
using Dog.Domain.Aggregates;
using Shared.Application.Handlers;

namespace Dog.Application.Handlers.Dog;

public class UpdateDogHandler(IDogRepository repository, IMapper mapper)
    : UpdateAggregateHandler<DogAggregate, DogDto, UpdateDogCommand>(repository, mapper);