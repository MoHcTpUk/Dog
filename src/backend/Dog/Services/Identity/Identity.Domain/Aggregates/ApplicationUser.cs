using Shared.Domain.Interfaces;

namespace Identity.Domain.Aggregates;

public class ApplicationUser : IAggregateRoot, IBaseModel
{
    public required string Email { get; set; }
    public required string UserName { get; set; }
    public required string PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public required Guid Id { get; set; }
}