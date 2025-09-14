using Microsoft.AspNetCore.Mvc;
using Users.Api.Commands.RegistrationRequest;
using Users.Api.Dtos;
using Users.Api.Services;

namespace Gateway.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class UsersController(IUserService userService)
    : ControllerBase
{
    [HttpPost(nameof(CreateRegistrationRequest))]
    public Task<RegistrationRequestDto> CreateRegistrationRequest(CreateRegistrationRequestCommand requestCommand)
    {
        var result = userService.CreateRegistrationRequest(requestCommand);

        return result;
    }

    [HttpPost(nameof(VerifyRegistrationRequest))]
    public Task<BearerTokenDto> VerifyRegistrationRequest(VerifyRegistrationRequestCommand requestCommand)
    {
        var result = userService.VerifyRegistrationRequest(requestCommand);

        return result;
    }
}