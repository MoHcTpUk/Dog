using Dog.Api.Commands.Dog;
using Dog.Api.Dtos;
using Dog.Api.Queries;
using Shared.Api.Services;

namespace Dog.Api.Services;

public interface IDogService : IService<CreateDogCommand, UpdateDogCommand, DeleteDogCommand, DogQuery, DogDto>;
