using Identity.Api.Commands;
using Identity.Api.Services;
using Microsoft.EntityFrameworkCore;
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
    : ICommandHandler<VerifyRegistrationRequestCommand, UserDto>
{
    private const int TemporaryPasswordLength = 20;

    public async Task<UserDto> Handle(VerifyRegistrationRequestCommand request,
        CancellationToken cancellationToken)
    {
        var registrationRequest = await registrationRequestRepository.AsQueryable()
            .FirstOrDefaultAsync(item => item.Id == request.Id, cancellationToken);

        if (registrationRequest is null || !registrationRequest.ActivationCode.Equals(request.VerificationCode))
            throw new Exception("Invalid verification code");
        
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
        
        return new UserDto
        {
            Email = registrationRequest.Email,
            Id = newUser.Id,
            UserName = username,
            Password = password,
            FirstName = string.Empty,
            LastName = string.Empty
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