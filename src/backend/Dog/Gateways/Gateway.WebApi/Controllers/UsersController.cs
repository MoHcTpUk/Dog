using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Users.Contracts.Commands.AuthorizationRequest;
using Users.Contracts.Commands.RegistrationRequest;
using Users.Contracts.Dtos;
using Users.Api.Services;

namespace Gateway.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class UsersController(IUserService userService)
    : ControllerBase
{
    [HttpPost(nameof(CreateAuthorizationRequest))]
    [AllowAnonymous]
    [Produces("application/json", "application/problem+json")]
    public async Task<ActionResult<RegistrationRequestDto>> CreateAuthorizationRequest(
        CreateAuthorizationRequestCommand requestCommand)
    {
        var result = await userService.CreateAuthorizationRequest(requestCommand);
        return result;
    }

    [HttpPost(nameof(CreateRegistrationRequest))]
    [AllowAnonymous]
    [Produces("application/json", "application/problem+json")]
    public async Task<ActionResult<RegistrationRequestDto>> CreateRegistrationRequest(
        CreateRegistrationRequestCommand requestCommand)
    {
        var result = await userService.CreateRegistrationRequest(requestCommand);
        return result;
    }
}