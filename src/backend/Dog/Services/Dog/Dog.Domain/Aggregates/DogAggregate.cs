using Dog.Domain.Enums;
using Shared.Domain.Interfaces;

namespace Dog.Domain.Aggregates;

public class DogAggregate : IAggregateRoot
{
    public required Guid Id { get; set; }

    public required string Name { get; set; }

    public Gender Gender { get; set; }

    public int Weight { get; set; }

    public Species Species { get; set; }

    public DateOnly Birthdate { get; set; }

    public Activity Activity { get; set; }

    public string? About { get; set; }
}
