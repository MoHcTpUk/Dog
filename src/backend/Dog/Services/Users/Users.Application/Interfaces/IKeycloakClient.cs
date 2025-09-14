using Users.Application.Models.Keycloak;

namespace Users.Application.Interfaces;

public interface IKeycloakClient
{
    Task<KeycloakTokenResponse> GetAdminTokenAsync();
    Task<KeycloakTokenResponse> GetClientTokenAsync();
    Task<KeycloakTokenResponse> RefreshTokenAsync(string refreshToken);

    Task<string> CreateUserAsync(CreateKeycloakUserRequest userRequest);
}