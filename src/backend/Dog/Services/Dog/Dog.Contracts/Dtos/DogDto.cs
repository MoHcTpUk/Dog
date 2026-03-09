using Shared.Dtos;
using Shared.Enumeration;
using Shared.Enums;

namespace Dog.Contracts.Dtos;

public record DogDto : Dto
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public Gender Gender { get; set; }

    public int Weight { get; set; }

    public Species Species { get; set; } = Species.Unknown;

    public DateOnly Birthdate { get; set; }

    public Activity Activity { get; set; }

    public string? About { get; set; }

    public List<Guid> PhotoIds { get; set; } = [];

    public Guid? OwnerId { get; set; }
}
