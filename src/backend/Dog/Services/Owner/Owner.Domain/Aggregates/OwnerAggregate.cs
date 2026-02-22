using Shared.Domain.Interfaces;

namespace Owner.Domain.Aggregates;

public class OwnerAggregate : IAggregateRoot
{
    public required Guid Id { get; set; }

    public required string Name { get; set; }

    public DateOnly Birthdate { get; set; }
}
