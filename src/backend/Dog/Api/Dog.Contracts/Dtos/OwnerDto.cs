using Shared.Dtos;

namespace Dog.Contracts.Dtos;

public record OwnerDto : Dto
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public DateOnly Birthdate { get; set; }
}
