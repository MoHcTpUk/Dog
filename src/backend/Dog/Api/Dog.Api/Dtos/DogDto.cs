using Shared.Dtos;

namespace Dog.Api.Dtos;

public record DogDto : Dto
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public Gender Gender { get; set; }

    public int Weight { get; set; }

    public Species Species { get; set; }

    public DateOnly Birthdate { get; set; }

    public Activity Activity { get; set; }

    public string? About { get; set; }
}

public enum Gender
{
    Unknown = 0,
    Male = 1,
    Female = 2
}

public enum Species
{
    Unknown = 0,
    Labrador = 1,
    Shepherd = 2,
    Bulldog = 3,
    Poodle = 4,
    Terrier = 5,
    Husky = 6,
    Other = 99
}

public enum Activity
{
    Low = 0,
    Medium = 1,
    High = 2
}
