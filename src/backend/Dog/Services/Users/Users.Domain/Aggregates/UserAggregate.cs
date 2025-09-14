using Shared.Domain.Interfaces;

namespace Users.Domain.Aggregates;

public class UserAggregate : IAggregateRoot
{
    public required string Email { get; set; }

    public required string Password { get; set; }

    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public string? About { get; set; }
    public required Guid Id { get; set; }
}