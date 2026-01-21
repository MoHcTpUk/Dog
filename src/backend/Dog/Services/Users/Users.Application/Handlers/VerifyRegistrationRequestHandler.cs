using Identity.Api.Commands;
using Identity.Api.Services;
using Microsoft.EntityFrameworkCore;
using OpenIddict.Abstractions;
using Shared.Messaging.Interfaces;
using Users.Api.Commands.RegistrationRequest;
using Users.Api.Dtos;
using Users.Domain.Aggregates;
using Users.Infrastructure.Repositories;

namespace Users.Application.Handlers;

public class VerifyRegistrationRequestHandler(
    IRegistrationRequestRepository registrationRequestRepository,
    IUserRepository userRepository,
    IIdentityService identityService
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

        var username = registrationRequest.Email.Split('@')[0].ToLowerInvariant();

        var password = GenerateTemporaryPassword();

        var newUser = new UserAggregate
        {
            Email = registrationRequest.Email,
            Id = Guid.NewGuid()
        };

        await userRepository.CreateAsync([newUser], cancellationToken);
        await userRepository.SaveChangesAsync();

        var createUserCommand = new CreateIdentityUserCommand
        {
            Email = registrationRequest.Email,
            UserName = username,
            Password = password
        };

        await identityService.CreateUserAsync(createUserCommand);

        List<string> scopes =
        [
            OpenIddictConstants.Scopes.OpenId, 
            OpenIddictConstants.Scopes.Profile,
            OpenIddictConstants.Scopes.Email, 
            OpenIddictConstants.Scopes.OfflineAccess
        ];
        
        var generateTokenCommand = new GenerateTokenCommand
        {
            Email = registrationRequest.Email,
            Password = password,
            Scope = string.Join(" ", scopes)
        };

        var tokenResult = await identityService.GenerateTokenAsync(generateTokenCommand);

        return new LoginUrlDto
        {
            AccessToken = tokenResult.AccessToken,
            RefreshToken = tokenResult.RefreshToken
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

        password[0] = uppercase[random.Next(uppercase.Length)];
        password[1] = lowercase[random.Next(lowercase.Length)];
        password[2] = digits[random.Next(digits.Length)];
        password[3] = special[random.Next(special.Length)];

        for (var i = 4; i < TemporaryPasswordLength; i++) password[i] = allChars[random.Next(allChars.Length)];

        for (var i = TemporaryPasswordLength - 1; i > 0; i--)
        {
            var j = random.Next(i + 1);
            (password[i], password[j]) = (password[j], password[i]);
        }

        return new string(password);
    }
}