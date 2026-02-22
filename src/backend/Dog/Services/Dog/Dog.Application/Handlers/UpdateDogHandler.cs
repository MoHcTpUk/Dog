using AutoMapper;
using Dog.Api.Commands.Dog;
using Dog.Api.Dtos;
using Dog.Domain.Aggregates;
using Dog.Infrastructure.Repositories;
using Shared.Application.Handlers;

namespace Dog.Application.Handlers;

public class UpdateDogHandler(IDogRepository repository, IMapper mapper)
    : UpdateAggregateHandler<DogAggregate, DogDto, UpdateDogCommand>(repository, mapper);
