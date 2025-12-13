using Shared.Domain.Interfaces;

namespace Users.Domain.Aggregates;

public class UserAggregate : IAggregateRoot
{
    public required string Email { get; set; }

    public required Guid Id { get; set; }

    public int AuthentikUserId { get; set; }
}