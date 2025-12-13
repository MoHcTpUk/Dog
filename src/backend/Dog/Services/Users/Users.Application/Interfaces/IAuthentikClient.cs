using Users.Application.Models.Authentik;

namespace Users.Application.Interfaces;

public interface IAuthentikClient
{
    Task<AuthentikTokenResponse> GetClientTokenAsync();
    Task<AuthentikTokenResponse> RefreshTokenAsync(string refreshToken);
    Task<AuthentikTokenResponse> GetUserTokenAsync(string username, string password);

    Task<int> CreateUserAsync(CreateAuthentikUserRequest userRequest);
    Task SetUserPasswordAsync(int userId, string password);
    Task<string> CreateLoginUrlAsync(string username);
}

