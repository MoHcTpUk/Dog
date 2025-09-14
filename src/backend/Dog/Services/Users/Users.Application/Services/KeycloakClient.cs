using System.Net.Http.Headers;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Users.Application.Interfaces;
using Users.Application.Models;
using Users.Application.Models.Keycloak;

namespace Users.Application.Services;

public class KeycloakClient : IKeycloakClient
{
    private readonly KeycloakConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly ILogger<KeycloakClient> _logger;
    private string? _adminToken;
    private DateTime _adminTokenExpiry;

    public KeycloakClient(
        HttpClient httpClient,
        IOptions<KeycloakConfiguration> configuration,
        ILogger<KeycloakClient> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration.Value;
        _logger = logger;

        _httpClient.BaseAddress = new Uri($"{_configuration.BaseUrl}/realms/{_configuration.Realm}/");
    }

    #region Управление пользователями

    public async Task<string> CreateUserAsync(CreateKeycloakUserRequest userRequest)
    {
        var token = await GetAdminTokenAsync();
        var json = JsonConvert.SerializeObject(userRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token.AccessToken);

        var response = await _httpClient.PostAsync("/admin/realms/master/users", content);

        if (response.IsSuccessStatusCode)
        {
            var location = response.Headers.Location?.ToString();
            if (!string.IsNullOrEmpty(location))
            {
                var userId = location.Split('/').Last();
                _logger.LogInformation("Пользователь создан с ID: {UserId}", userId);
                return userId;
            }
        }

        var errorContent = await response.Content.ReadAsStringAsync();
        _logger.LogError("Ошибка создания пользователя: {Error}", errorContent);
        throw new HttpRequestException($"Ошибка создания пользователя: {response.StatusCode}");
    }

    #endregion

    #region Аутентификация

    public async Task<KeycloakTokenResponse> GetAdminTokenAsync()
    {
        if (!string.IsNullOrEmpty(_adminToken) && DateTime.UtcNow < _adminTokenExpiry)
            return new KeycloakTokenResponse { AccessToken = _adminToken };

        var tokenRequest = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("grant_type", "password"),
            new KeyValuePair<string, string>("client_id", _configuration.ClientId),
            new KeyValuePair<string, string>("client_secret", _configuration.ClientSecret),
            new KeyValuePair<string, string>("username", _configuration.AdminUsername),
            new KeyValuePair<string, string>("password", _configuration.AdminPassword)
        ]);

        var response = await _httpClient.PostAsync("protocol/openid-connect/token", tokenRequest);

        var content = await response.Content.ReadAsStringAsync();
        var tokenResponse = JsonConvert.DeserializeObject<KeycloakTokenResponse>(content);

        if (tokenResponse != null)
        {
            _adminToken = tokenResponse.AccessToken;
            _adminTokenExpiry = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn - 60); // 60 секунд буфер
        }

        return tokenResponse ?? throw new InvalidOperationException("Не удалось получить токен администратора");
    }

    public async Task<KeycloakTokenResponse> GetClientTokenAsync()
    {
        var tokenRequest = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("grant_type", "client_credentials"),
            new KeyValuePair<string, string>("client_id", _configuration.ClientId),
            new KeyValuePair<string, string>("client_secret", _configuration.ClientSecret)
        ]);

        var response = await _httpClient.PostAsync("protocol/openid-connect/token", tokenRequest);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var tokenResponse = JsonConvert.DeserializeObject<KeycloakTokenResponse>(content);

        return tokenResponse ?? throw new InvalidOperationException("Не удалось получить клиентский токен");
    }

    public async Task<KeycloakTokenResponse> RefreshTokenAsync(string refreshToken)
    {
        var tokenRequest = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("grant_type", "refresh_token"),
            new KeyValuePair<string, string>("client_id", _configuration.ClientId),
            new KeyValuePair<string, string>("client_secret", _configuration.ClientSecret),
            new KeyValuePair<string, string>("refresh_token", refreshToken)
        ]);

        var response = await _httpClient.PostAsync("protocol/openid-connect/token", tokenRequest);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var tokenResponse = JsonConvert.DeserializeObject<KeycloakTokenResponse>(content);

        return tokenResponse ?? throw new InvalidOperationException("Не удалось обновить токен");
    }

    #endregion
}