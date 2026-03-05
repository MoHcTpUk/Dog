using Dog.Contracts.Dtos;
using Shared.Api.Commands;
using Shared.Dtos;

namespace Dog.Contracts.Commands.Owner;

public class DeleteOwnerCommand : DeleteCommand<ResultContainer<OwnerDto>>;
