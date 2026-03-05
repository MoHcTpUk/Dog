using Dog.Contracts.Dtos;
using Shared.Api.Commands;
using Shared.Dtos;

namespace Dog.Contracts.Commands.Dog;

public class DeleteDogCommand : DeleteCommand<ResultContainer<DogDto>>;
