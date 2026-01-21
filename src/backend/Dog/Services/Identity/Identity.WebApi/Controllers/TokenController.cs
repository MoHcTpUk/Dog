using Microsoft.AspNetCore.Mvc;
using OpenIddict.Abstractions;

namespace Identity.WebApi.Controllers;

[ApiController]
[Route("connect")]
public class TokenController(
    IOpenIddictTokenManager tokenManager)
    : ControllerBase
{
    [HttpPost("token")]
    [Produces("application/json")]
    public async Task<IActionResult> Exchange()
    {
        throw new NotImplementedException();
    }
}