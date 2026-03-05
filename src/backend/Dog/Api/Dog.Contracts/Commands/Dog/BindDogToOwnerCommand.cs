using Dog.Contracts.Dtos;
using Shared.Api.Commands;
using Shared.Dtos;

namespace Dog.Contracts.Commands.Dog;

public class BindDogToOwnerCommand : Command<ResultContainer<DogDto>>
{
    public required Guid DogId { get; set; }

    public required Guid OwnerId { get; set; }
}
