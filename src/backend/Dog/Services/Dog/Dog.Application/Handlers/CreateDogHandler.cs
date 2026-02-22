using AutoMapper;
using Dog.Api.Commands.Dog;
using Dog.Api.Dtos;
using Dog.Domain.Aggregates;
using Dog.Infrastructure.Repositories;
using Shared.Application.Handlers;

namespace Dog.Application.Handlers;

public class CreateDogHandler(IDogRepository repository, IMapper mapper)
    : CreateAggregateHandler<DogAggregate, DogDto, CreateDogCommand>(repository, mapper);
