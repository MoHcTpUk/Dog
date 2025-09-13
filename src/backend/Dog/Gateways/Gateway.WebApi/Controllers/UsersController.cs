using Microsoft.AspNetCore.Mvc;
using Shared.Api;
using Users.Api.Commands.RegistrationRequest;
using Users.Api.Commands.User;
using Users.Api.Dtos;
using Users.Api.Queries;
using Users.Api.Services;

namespace Gateway.Api.Controllers;

public class UsersController(IUserService userService)
    : AbstractController<IUserService, UserDto, CreateUserCommand, UpdateUserCommand, DeleteUserCommand, UserQuery,
        UserDto>(userService)
{
    [HttpPost(nameof(CreateRegistrationRequest))]
    public async Task CreateRegistrationRequest(CreateRegistrationRequest request)
    {
        await userService.CreateRegistrationRequest(request);
    }
}