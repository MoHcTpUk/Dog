using AutoMapper;
using Dog.Api.Commands.Dog;
using Dog.Api.Dtos;
using Dog.Domain.Aggregates;
using Dog.Infrastructure.Repositories;
using Shared.Application.Handlers;

namespace Dog.Application.Handlers;

public class DeleteDogHandler(IDogRepository repository, IMapper mapper)
    : DeleteAggregateHandler<DogAggregate, DogDto, DeleteDogCommand>(repository, mapper);
