using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Users.Contracts.Commands.AuthRequest;
using Users.Contracts.Dtos;
using Users.Api.Services;

namespace Gateway.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class UsersController(IUserService userService)
    : ControllerBase
{
    [HttpPost(nameof(CreateAuthRequest))]
    [AllowAnonymous]
    [Produces("application/json", "application/problem+json")]
    public async Task<ActionResult<AuthRequestDto>> CreateAuthRequest(
        CreateAuthRequestCommand requestCommand)
    {
        var result = await userService.CreateAuthRequest(requestCommand);
        return result;
    }
}