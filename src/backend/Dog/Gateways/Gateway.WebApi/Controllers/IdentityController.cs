using Identity.Api.Commands;
using Identity.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Gateway.Api.Controllers;

[ApiController]
[Route("api/identity")]
public class IdentityController : ControllerBase
{
    private readonly IIdentityService _identityService;

    public IdentityController(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    [HttpPost("create-user")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var command = new CreateIdentityUserCommand
            {
                Email = request.Email,
                UserName = request.UserName,
                Password = request.Password
            };

            var userId = await _identityService.CreateUserAsync(command);

            return Ok(new { UserId = userId });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }
}

public class CreateUserRequest
{
    public required string Email { get; set; }
    public required string UserName { get; set; }
    public required string Password { get; set; }
}