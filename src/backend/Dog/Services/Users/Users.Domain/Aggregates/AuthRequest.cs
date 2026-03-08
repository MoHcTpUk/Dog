using Shared.Domain.Interfaces;

namespace Users.Domain.Aggregates;

public class AuthRequest : IAggregateRoot
{
    public required string Email { get; set; }
    
    public required string ActivationCode { get; set; }

    public required Guid Id { get; set; }
}