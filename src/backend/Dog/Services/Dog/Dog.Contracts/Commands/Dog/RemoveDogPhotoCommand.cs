using Dog.Contracts.Dtos;
using Shared.Api.Commands;
using Shared.Dtos;

namespace Dog.Contracts.Commands.Dog;

public class RemoveDogPhotoCommand : Command<ResultContainer<DogDto>>
{
    public required Guid DogId { get; set; }

    public required Guid PhotoId { get; set; }
}
