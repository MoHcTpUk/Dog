using Microsoft.EntityFrameworkCore;
using Shared.Messaging.Interfaces;
using Users.Api.Commands.RegistrationRequest;
using Users.Api.Dtos;
using Users.Domain.Aggregates;
using Users.Infrastructure.Repositories;

namespace Users.Application.Handlers;

public class VerifyRegistrationRequestHandler(
    IRegistrationRequestRepository registrationRequestRepository,
    IUserRepository userRepository
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
                LoginUrl = string.Empty
            };

        // Генерируем username из email (можно использовать часть до @)
        var username = registrationRequest.Email.Split('@')[0].ToLowerInvariant();

        // Генерируем временный пароль
        var password = GenerateTemporaryPassword();
        
        // 2. Создаём пользователя в своей БД
        var newUser = new UserAggregate
        {
            Email = registrationRequest.Email,
            Id = Guid.NewGuid(),
        };

        await userRepository.CreateAsync([newUser], cancellationToken);
        await userRepository.SaveChangesAsync();

        return new LoginUrlDto
        {
            LoginUrl = ""
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