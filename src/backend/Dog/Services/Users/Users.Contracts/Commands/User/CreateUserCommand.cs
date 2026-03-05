using Shared.Api.Commands;
using Shared.Dtos;
using Users.Contracts.Dtos;

namespace Users.Contracts.Commands.User;

public class CreateUserCommand : CreateCommand<ResultContainer<UserDto>>
{
    public required string Email { get; set; }

    public required string Password { get; set; }

    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public string? About { get; set; }
}
