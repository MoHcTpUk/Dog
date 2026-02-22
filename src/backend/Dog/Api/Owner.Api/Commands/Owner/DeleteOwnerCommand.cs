using Owner.Api.Dtos;
using Shared.Api.Commands;
using Shared.Dtos;

namespace Owner.Api.Commands.Owner;

public class DeleteOwnerCommand : DeleteCommand<ResultContainer<OwnerDto>>;
