using AutoMapper;
using Dog.Api.Commands.Dog;
using Dog.Api.Dtos;
using Dog.Domain;
using Dog.Domain.Aggregates;
using Shared.Application.Handlers;

namespace Dog.Application.Handlers.Dog;

public class UpdateDogHandler(IDogRepository repository, IMapper mapper)
    : UpdateAggregateHandler<DogAggregate, DogDto, UpdateDogCommand>(repository, mapper);