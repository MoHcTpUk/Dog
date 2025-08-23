using Shared.Api.Commands;
using Shared.Dtos;
using Users.Api.Dtos;

namespace Users.Api.Commands.User;

public class DeleteUserCommand : DeleteCommand<ResultContainer<UserDto>>;