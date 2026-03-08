using Identity.Contracts.Commands;
using Identity.Contracts.Services;
using Microsoft.EntityFrameworkCore;
using Shared.Messaging.Interfaces;
using Users.Application.Interfaces;
using Users.Contracts.Commands.AuthRequest;
using Users.Contracts.Dtos;
using Users.Domain.Aggregates;

namespace Users.Application.Handlers;

public class VerifyAuthRequestHandler(
    IAuthRequestRepository authRequestRepository,
    IUserRepository userRepository,
    IIdentityService identityService
)
    : ICommandHandler<VerifyAuthRequestCommand, UserDto>
{
    private const int TemporaryPasswordLength = 20;

    public async Task<UserDto> Handle(VerifyAuthRequestCommand request,
        CancellationToken cancellationToken)
    {
        var authRequest = await authRequestRepository.AsQueryable()
            .FirstOrDefaultAsync(item => item.Id == request.Id, cancellationToken);

        if (authRequest is null || !authRequest.ActivationCode.Equals(request.VerificationCode))
            throw new Exception("Invalid verification code");

        var existingUser = await userRepository.AsQueryable()
            .FirstOrDefaultAsync(item => item.Email == authRequest.Email, cancellationToken);

        if (existingUser is not null) return await ProcessExistUser(existingUser, authRequest, cancellationToken);

        return await ProcessNewUser(authRequest, cancellationToken);
    }

    private async Task<UserDto> ProcessNewUser(AuthRequest authRequest, CancellationToken cancellationToken)
    {
        var username = authRequest.Email.Split('@')[0].ToLowerInvariant();
        var password = GenerateTemporaryPassword();

        var newUser = new UserAggregate
        {
            Email = authRequest.Email,
            Id = Guid.NewGuid()
        };

        await userRepository.CreateAsync([newUser], cancellationToken);
        await userRepository.SaveChangesAsync();

        var createUserCommand = new CreateIdentityUserCommand
        {
            Email = authRequest.Email,
            UserName = username,
            Password = password
        };

        await identityService.CreateUserAsync(createUserCommand);

        authRequestRepository.DeleteAsync([authRequest]);
        await authRequestRepository.SaveChangesAsync();

        return new UserDto
        {
            Email = authRequest.Email,
            Id = newUser.Id,
            UserName = username,
            Password = password,
            FirstName = string.Empty,
            LastName = string.Empty
        };
    }

    private async Task<UserDto> ProcessExistUser(UserAggregate existingUser, AuthRequest authRequest,
        CancellationToken cancellationToken)
    {
        var password = GenerateTemporaryPassword();

        var updatePasswordCommand = new SetIdentityUserPasswordCommand
        {
            Email = authRequest.Email,
            Password = password
        };

        var updatePasswordResult = await identityService.SetUserPasswordAsync(updatePasswordCommand);

        if (!updatePasswordResult.Success)
            throw new Exception(updatePasswordResult.ErrorMessage ?? "Unable to update user password.");

        authRequestRepository.DeleteAsync([authRequest]);
        await authRequestRepository.SaveChangesAsync();

        return new UserDto
        {
            Email = authRequest.Email,
            Id = existingUser.Id,
            UserName = authRequest.Email,
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