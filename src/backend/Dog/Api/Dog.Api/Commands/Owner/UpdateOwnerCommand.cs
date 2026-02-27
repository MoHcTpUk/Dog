using Dog.Api.Dtos;
using Shared.Api.Commands;
using Shared.Dtos;

namespace Dog.Api.Commands.Owner;

public class UpdateOwnerCommand : UpdateCommand<ResultContainer<OwnerDto>>
{
    public required string Name { get; set; }

    public DateOnly Birthdate { get; set; }
}
