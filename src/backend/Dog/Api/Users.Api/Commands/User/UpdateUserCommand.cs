using Shared.Api.Commands;
using Shared.Dtos;
using Users.Api.Dtos;

namespace Users.Api.Commands.User;

public class UpdateUserCommand : UpdateCommand<ResultContainer<UserDto>>
{
    public required string Email { get; set; }

    public required string Password { get; set; }

    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public string? About { get; set; }
}