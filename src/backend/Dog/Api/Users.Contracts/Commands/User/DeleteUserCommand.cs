using Shared.Api.Commands;
using Shared.Dtos;
using Users.Contracts.Dtos;

namespace Users.Contracts.Commands.User;

public class DeleteUserCommand : DeleteCommand<ResultContainer<UserDto>>;
