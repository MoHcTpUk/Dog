using Dog.Api.Commands.Dog;
using Dog.Api.Dtos;
using Dog.Api.Queries;
using Shared.Api.Services;
using Shared.Dtos;

namespace Dog.Api.Services;

public interface IDogService : IService<CreateDogCommand, UpdateDogCommand, DeleteDogCommand, DogQuery, DogDto>
{
    Task<ResultContainer<DogDto>> BindToOwnerAsync(BindDogToOwnerCommand command);

    Task<ResultContainer<DogDto>> UnbindFromOwnerAsync(UnbindDogFromOwnerCommand command);
}
