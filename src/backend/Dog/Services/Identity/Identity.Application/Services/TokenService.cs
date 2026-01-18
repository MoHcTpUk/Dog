using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Identity.Application.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<string?> GenerateTokenAsync(ClaimsPrincipal principal, IEnumerable<string> scopes, CancellationToken cancellationToken)
    {
        // OpenIddict генерирует JWT токен через SignIn, который работает в HTTP контексте
        // Для программной генерации используем упрощенный подход - создаем JWT вручную
        // Используем тот же signing key, что и OpenIddict
        
        try
        {
            // Получаем signing key из конфигурации
            var signingKey = _configuration["OpenIddict:SigningKey"] ?? 
                           "your-secret-signing-key-change-in-production-minimum-32-characters";
            
            // Создаем signing credentials
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Создаем claims для токена
            var claims = new List<Claim>();
            if (principal.Identity is ClaimsIdentity identity)
            {
                claims.AddRange(identity.Claims);
            }

            // Добавляем стандартные claims для JWT
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                SigningCredentials = credentials,
                Issuer = "dog-app",
                Audience = "dog-app"
            };

            var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return await Task.FromResult(tokenString);
        }
        catch
        {
            return null;
        }
    }
}
