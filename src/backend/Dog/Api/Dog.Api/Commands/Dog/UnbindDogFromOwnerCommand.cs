using Dog.Api.Dtos;
using Shared.Api.Commands;
using Shared.Dtos;

namespace Dog.Api.Commands.Dog;

public class UnbindDogFromOwnerCommand : Command<ResultContainer<DogDto>>
{
    public required Guid DogId { get; set; }
}
