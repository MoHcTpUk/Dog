using Dog.Api.Dtos;
using Shared.Api.Commands;
using Shared.Dtos;

namespace Dog.Api.Commands.Dog;

public class BindDogToOwnerCommand : Command<ResultContainer<DogDto>>
{
    public required Guid DogId { get; set; }

    public required Guid OwnerId { get; set; }
}
