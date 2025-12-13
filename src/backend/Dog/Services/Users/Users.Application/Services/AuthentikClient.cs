using System.Net.Http.Headers;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Users.Application.Interfaces;
using Users.Application.Models.Authentik;

namespace Users.Application.Services;

public class AuthentikClient : IAuthentikClient
{
    private readonly AuthentikConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly ILogger<AuthentikClient> _logger;

    public AuthentikClient(
        HttpClient httpClient,
        IOptions<AuthentikConfiguration> configuration,
        ILogger<AuthentikClient> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration.Value;
        _logger = logger;

        _httpClient.BaseAddress = new Uri(_configuration.BaseUrl);
    }

    #region Управление пользователями

    public async Task<int> CreateUserAsync(CreateAuthentikUserRequest userRequest)
    {
        var json = JsonConvert.SerializeObject(userRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", _configuration.ApiToken);

        var response = await _httpClient.PostAsync("/api/v3/core/users/", content);

        if (response.IsSuccessStatusCode)
        {
            var responseContent = await response.Content.ReadAsStringAsync();
            var createdUser = JsonConvert.DeserializeObject<AuthentikUser>(responseContent);

            if (createdUser != null)
            {
                _logger.LogInformation("Пользователь создан с ID: {UserId}", createdUser.Pk);
                return createdUser.Pk;
            }
        }

        var errorContent = await response.Content.ReadAsStringAsync();
        _logger.LogError("Ошибка создания пользователя: {Error}", errorContent);
        throw new HttpRequestException($"Ошибка создания пользователя: {response.StatusCode}");
    }

    public async Task SetUserPasswordAsync(int userId, string password)
    {
        var passwordRequest = new SetPasswordRequest
        {
            Password = password
        };

        var json = JsonConvert.SerializeObject(passwordRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", _configuration.ApiToken);

        var response = await _httpClient.PostAsync($"/api/v3/core/users/{userId}/set_password/", content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("Ошибка установки пароля: {Error}", errorContent);
            throw new HttpRequestException($"Ошибка установки пароля: {response.StatusCode}");
        }

        _logger.LogInformation("Пароль установлен для пользователя: {UserId}", userId);
    }

    #endregion

    #region Аутентификация

    public async Task<AuthentikTokenResponse> GetClientTokenAsync()
    {
        var tokenRequest = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("grant_type", "client_credentials"),
            new KeyValuePair<string, string>("client_id", _configuration.ClientId),
            new KeyValuePair<string, string>("client_secret", _configuration.ClientSecret),
            new KeyValuePair<string, string>("scope", "openid profile email")
        ]);

        var response = await _httpClient.PostAsync("/application/o/token/", tokenRequest);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var tokenResponse = JsonConvert.DeserializeObject<AuthentikTokenResponse>(content);

        return tokenResponse ?? throw new InvalidOperationException("Не удалось получить клиентский токен");
    }

    public async Task<AuthentikTokenResponse> GetUserTokenAsync(string username, string password)
    {
        var tokenRequest = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("grant_type", "password"),
            new KeyValuePair<string, string>("client_id", _configuration.ClientId),
            new KeyValuePair<string, string>("client_secret", _configuration.ClientSecret),
            new KeyValuePair<string, string>("username", username),
            new KeyValuePair<string, string>("password", password),
            new KeyValuePair<string, string>("scope", "openid profile email")
        ]);

        var response = await _httpClient.PostAsync("/application/o/token/", tokenRequest);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var tokenResponse = JsonConvert.DeserializeObject<AuthentikTokenResponse>(content);

        return tokenResponse ?? throw new InvalidOperationException("Не удалось получить токен пользователя");
    }

    public async Task<AuthentikTokenResponse> RefreshTokenAsync(string refreshToken)
    {
        var tokenRequest = new FormUrlEncodedContent([
            new KeyValuePair<string, string>("grant_type", "refresh_token"),
            new KeyValuePair<string, string>("client_id", _configuration.ClientId),
            new KeyValuePair<string, string>("client_secret", _configuration.ClientSecret),
            new KeyValuePair<string, string>("refresh_token", refreshToken)
        ]);

        var response = await _httpClient.PostAsync("/application/o/token/", tokenRequest);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var tokenResponse = JsonConvert.DeserializeObject<AuthentikTokenResponse>(content);

        return tokenResponse ?? throw new InvalidOperationException("Не удалось обновить токен");
    }

    public Task<string> CreateLoginUrlAsync(string username)
    {
        if (string.IsNullOrWhiteSpace(_configuration.RedirectUri))
        {
            throw new InvalidOperationException(
                "Authentik RedirectUri не настроен. Добавьте Authentik:RedirectUri в appsettings.{Environment}.json (например, Users.Service/appsettings.Local.json) или appsettings.json.");
        }

        var baseUrl = _configuration.BaseUrl.TrimEnd('/');
        // Authentik OAuth2 authorize endpoint обычно со слэшем в конце: /application/o/authorize/
        var authorizeUrl = $"{baseUrl}/application/o/authorize/";
        
        var queryParams = new List<KeyValuePair<string, string>>
        {
            new("response_type", "code"),
            new("client_id", _configuration.ClientId),
            new("redirect_uri", _configuration.RedirectUri),
            new("scope", "openid profile email"),
            new("login_hint", username),
            new("prompt", "login")
        };

        var queryString = string.Join("&", queryParams.Select(p => 
            $"{Uri.EscapeDataString(p.Key)}={Uri.EscapeDataString(p.Value)}"));
        
        var loginUrl = $"{authorizeUrl}?{queryString}";
        _logger.LogInformation("Создан login URL для пользователя {Username}: {LoginUrl}", username, loginUrl);
        
        return Task.FromResult(loginUrl);
    }

    #endregion
}

