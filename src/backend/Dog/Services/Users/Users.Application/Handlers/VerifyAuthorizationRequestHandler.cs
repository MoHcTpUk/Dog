using Identity.Contracts.Commands;
using Identity.Contracts.Services;
using Microsoft.EntityFrameworkCore;
using Shared.Messaging.Interfaces;
using Users.Application.Interfaces;
using Users.Contracts.Commands.AuthorizationRequest;
using Users.Contracts.Dtos;

namespace Users.Application.Handlers;

public class VerifyAuthorizationRequestHandler(
    IRegistrationRequestRepository registrationRequestRepository,
    IUserRepository userRepository,
    IIdentityService identityService
)
    : ICommandHandler<VerifyAuthorizationRequestCommand, UserDto>
{
    private const int TemporaryPasswordLength = 20;

    public async Task<UserDto> Handle(VerifyAuthorizationRequestCommand request,
        CancellationToken cancellationToken)
    {
        var authorizationRequest = await registrationRequestRepository.AsQueryable()
            .FirstOrDefaultAsync(item => item.Id == request.Id, cancellationToken);

        if (authorizationRequest is null || !authorizationRequest.ActivationCode.Equals(request.VerificationCode))
            throw new Exception("Invalid verification code");

        var user = await userRepository.AsQueryable()
            .FirstOrDefaultAsync(item => item.Email == authorizationRequest.Email, cancellationToken);

        if (user is null)
            throw new Exception("User with this email does not exist.");

        var password = GenerateTemporaryPassword();

        var updatePasswordCommand = new SetIdentityUserPasswordCommand
        {
            Email = authorizationRequest.Email,
            Password = password
        };

        var updatePasswordResult = await identityService.SetUserPasswordAsync(updatePasswordCommand);

        if (!updatePasswordResult.Success)
            throw new Exception(updatePasswordResult.ErrorMessage ?? "Unable to update user password.");

        registrationRequestRepository.DeleteAsync([authorizationRequest]);
        await registrationRequestRepository.SaveChangesAsync();

        return new UserDto
        {
            Email = authorizationRequest.Email,
            Id = user.Id,
            UserName = authorizationRequest.Email,
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
