using Dog.Api.Dtos;
using Shared.Api.Commands;
using Shared.Dtos;

namespace Dog.Api.Commands.Owner;

public class DeleteOwnerCommand : DeleteCommand<ResultContainer<OwnerDto>>;
