using Shared.Domain.Interfaces;
using Shared.Enumeration;
using Shared.Enums;

namespace Dog.Domain.Aggregates;

public class DogAggregate : IAggregateRoot
{
    public required string Name { get; set; }

    public Gender Gender { get; set; }

    public int Weight { get; set; }

    public Species Species { get; set; } = Species.Unknown;

    public DateOnly Birthdate { get; set; }

    public Activity Activity { get; set; }

    public string? About { get; set; }

    public Guid? OwnerId { get; set; }

    public required Guid Id { get; set; }
}