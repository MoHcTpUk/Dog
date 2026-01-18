using Identity.Application.Services;
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
            var userId = await _identityService.CreateUserAsync(
                request.Email,
                request.UserName,
                request.Password,
                cancellationToken);

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