using AutoMapper;
using Dog.Api.Commands.Dog;
using Dog.Api.Dtos;
using Dog.Domain;
using Dog.Domain.Aggregates;
using Shared.Application.Handlers;

namespace Dog.Application.Handlers.Dog;

public class DeleteDogHandler(IDogRepository repository, IMapper mapper)
    : DeleteAggregateHandler<DogAggregate, DogDto, DeleteDogCommand>(repository, mapper);