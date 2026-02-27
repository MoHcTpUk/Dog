using Dog.Api.Dtos;
using Shared.Api.Commands;
using Shared.Dtos;
using Shared.Enumeration;

namespace Dog.Api.Commands.Dog;

public class CreateDogCommand : CreateCommand<ResultContainer<DogDto>>
{
    public required string Name { get; set; }

    public Gender Gender { get; set; }

    public int Weight { get; set; }

    public Species Species { get; set; } = Species.Unknown;

    public DateOnly Birthdate { get; set; }

    public Activity Activity { get; set; }

    public string? About { get; set; }
}
