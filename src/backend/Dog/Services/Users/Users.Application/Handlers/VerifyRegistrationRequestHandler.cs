using Identity.Api.Commands;
using Identity.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Messaging.Interfaces;
using Users.Api.Commands.RegistrationRequest;
using Users.Api.Dtos;
using Users.Domain.Aggregates;
using Users.Infrastructure.Repositories;

namespace Users.Application.Handlers;

public class VerifyRegistrationRequestHandler(
    IRegistrationRequestRepository registrationRequestRepository,
    IUserRepository userRepository,
    IIdentityService identityService,
    ILogger<VerifyRegistrationRequestHandler> logger
)
    : ICommandHandler<VerifyRegistrationRequestCommand, LoginUrlDto>
{
    private const int TemporaryPasswordLength = 20;

    public async Task<LoginUrlDto> Handle(VerifyRegistrationRequestCommand request,
        CancellationToken cancellationToken)
    {
        var registrationRequest = await registrationRequestRepository.AsQueryable()
            .FirstOrDefaultAsync(item => item.Id == Guid.Parse(request.Id), cancellationToken);

        if (registrationRequest == null || registrationRequest.ActivationCode != request.VerificationCode)
            return new LoginUrlDto
            {
                AccessToken = null
            };

        // Генерируем username из email (можно использовать часть до @)
        var username = registrationRequest.Email.Split('@')[0].ToLowerInvariant();

        // Генерируем временный пароль
        var password = GenerateTemporaryPassword();

        // Создаём пользователя в своей БД
        var newUser = new UserAggregate
        {
            Email = registrationRequest.Email,
            Id = Guid.NewGuid()
        };

        await userRepository.CreateAsync([newUser], cancellationToken);
        await userRepository.SaveChangesAsync();

        // Создаём пользователя в Identity сервисе через NATS
        string? token = null;
        try
        {
            var createUserCommand = new CreateIdentityUserCommand
            {
                Email = registrationRequest.Email,
                UserName = username,
                Password = password
            };

            var createUserResult = await identityService.CreateUserAsync(createUserCommand);

            if (createUserResult.Success)
            {
                // Получаем токен через NATS
                var generateTokenCommand = new GenerateTokenCommand
                {
                    Email = registrationRequest.Email,
                    Password = password,
                    Scope = "openid profile email"
                };

                var tokenResult = await identityService.GenerateTokenAsync(generateTokenCommand);

                if (tokenResult.Success && !string.IsNullOrEmpty(tokenResult.AccessToken))
                    token = tokenResult.AccessToken;
                else
                    logger.LogWarning("Failed to generate token: {Error}", tokenResult.ErrorMessage);
            }
            else
            {
                var errorMessage = createUserResult?.ErrorMessage ?? "Unknown error";
                logger.LogWarning("Failed to create user in Identity service: {Error}", errorMessage);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating user in Identity service or getting token");
        }

        return new LoginUrlDto
        {
            AccessToken = token
        };
    }

    private static string GenerateTemporaryPassword()
    {
        const string uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string lowercase = "abcdefghijklmnopqrstuvwxyz";
        const string digits = "0123456789";
        const string special = "!@#$%^&*()-_=+[]{}|;:,.<>?";
        const string allChars = uppercase + lowercase + digits + special;

        var random = new Random();
        var password = new char[TemporaryPasswordLength];

        // Гарантируем наличие хотя бы одного символа каждого типа
        password[0] = uppercase[random.Next(uppercase.Length)];
        password[1] = lowercase[random.Next(lowercase.Length)];
        password[2] = digits[random.Next(digits.Length)];
        password[3] = special[random.Next(special.Length)];

        // Заполняем остальные позиции случайными символами
        for (var i = 4; i < TemporaryPasswordLength; i++) password[i] = allChars[random.Next(allChars.Length)];

        // Перемешиваем символы
        for (var i = TemporaryPasswordLength - 1; i > 0; i--)
        {
            var j = random.Next(i + 1);
            (password[i], password[j]) = (password[j], password[i]);
        }

        return new string(password);
    }
}