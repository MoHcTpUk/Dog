using Users.Application.Models.Keycloak;

namespace Users.Application.Interfaces;

public interface IKeycloakClient
{
    Task<KeycloakTokenResponse> GetAdminTokenAsync();
    Task<KeycloakTokenResponse> GetClientTokenAsync();
    Task<KeycloakTokenResponse> RefreshTokenAsync(string refreshToken);
    Task<KeycloakTokenResponse> GetUserTokenAsync(string username, string password);

    Task<Guid> CreateUserAsync(CreateKeycloakUserRequest userRequest);
    Task SetUserPasswordAsync(Guid userId, string password);
}