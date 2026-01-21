using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Abstractions;

namespace Identity.Application.Services;

public class TokenService(
    IConfiguration configuration,
    IIdentityService identityService,
    IOpenIddictTokenManager tokenManager) : ITokenService
{
    public async Task<string?> GenerateTokenAsync(ClaimsPrincipal principal)
    {
        var signingKey = configuration["OpenIddict:SigningKey"] ??
                         "your-secret-signing-key-change-in-production-minimum-32-characters";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>();
        if (principal.Identity is ClaimsIdentity identity) claims.AddRange(identity.Claims);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(24),
            SigningCredentials = credentials,
            Issuer = "dog-app",
            Audience = "dog-app"
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        return await Task.FromResult(tokenString);
    }
}