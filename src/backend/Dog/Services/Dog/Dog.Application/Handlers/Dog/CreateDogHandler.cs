using AutoMapper;
using Dog.Api.Commands.Dog;
using Dog.Api.Dtos;
using Dog.Domain;
using Dog.Domain.Aggregates;
using Shared.Application.Handlers;

namespace Dog.Application.Handlers.Dog;

public class CreateDogHandler(IDogRepository repository, IMapper mapper)
    : CreateAggregateHandler<DogAggregate, DogDto, CreateDogCommand>(repository, mapper);