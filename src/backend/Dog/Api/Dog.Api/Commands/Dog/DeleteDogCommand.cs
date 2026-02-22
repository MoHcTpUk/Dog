using Dog.Api.Dtos;
using Shared.Api.Commands;
using Shared.Dtos;

namespace Dog.Api.Commands.Dog;

public class DeleteDogCommand : DeleteCommand<ResultContainer<DogDto>>;
