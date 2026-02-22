using Owner.Api.Dtos;
using Shared.Api.Commands;
using Shared.Dtos;

namespace Owner.Api.Commands.Owner;

public class CreateOwnerCommand : CreateCommand<ResultContainer<OwnerDto>>
{
    public required string Name { get; set; }

    public DateOnly Birthdate { get; set; }
}
