using Dog.Contracts.Dtos;
using Shared.Api.Commands;
using Shared.Dtos;

namespace Dog.Contracts.Commands.Dog;

public class UnbindDogFromOwnerCommand : Command<ResultContainer<DogDto>>
{
    public required Guid DogId { get; set; }
}
