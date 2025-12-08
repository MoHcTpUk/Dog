using Microsoft.EntityFrameworkCore;
using Shared.Messaging.Interfaces;
using Users.Api.Commands.RegistrationRequest;
using Users.Api.Dtos;
using Users.Application.Interfaces;
using Users.Application.Models.Authentik;
using Users.Domain.Aggregates;
using Users.Infrastructure.Repositories;

namespace Users.Application.Handlers;

public class VerifyRegistrationRequestHandler(
    IRegistrationRequestRepository registrationRequestRepository,
    IAuthentikClient authentikClient,
    IUserRepository userRepository
)
    : ICommandHandler<VerifyRegistrationRequestCommand, BearerTokenDto>
{
    private const int TemporaryPasswordLength = 20;

    public async Task<BearerTokenDto> Handle(VerifyRegistrationRequestCommand request,
        CancellationToken cancellationToken)
    {
        var registrationRequest = await registrationRequestRepository.AsQueryable()
            .FirstOrDefaultAsync(item => item.Id == Guid.Parse(request.Id), cancellationToken);

        if (registrationRequest == null || registrationRequest.ActivationCode != request.VerificationCode)
            return new BearerTokenDto
            {
                AccessToken = string.Empty,
                ExpiresIn = 0,
                RefreshToken = string.Empty
            };

        var username = $"user{Guid.NewGuid():N}";
        var password = $"{Guid.NewGuid():N}"[..TemporaryPasswordLength];

        var newAuthentikUser = new CreateAuthentikUserRequest
        {
            Username = username,
            Email = registrationRequest.Email,
            Name = username
        };

        var authentikUserId = await authentikClient.CreateUserAsync(newAuthentikUser);

        await authentikClient.SetUserPasswordAsync(authentikUserId, password);

        var tokenResponse = await authentikClient.GetUserTokenAsync(username, password);

        var newUser = new UserAggregate
        {
            Email = registrationRequest.Email,
            Id = Guid.NewGuid()
        };

        await userRepository.CreateAsync([newUser], cancellationToken);
        await userRepository.SaveChangesAsync();

        return new BearerTokenDto
        {
            AccessToken = tokenResponse.AccessToken,
            ExpiresIn = tokenResponse.ExpiresIn,
            RefreshToken = tokenResponse.RefreshToken ?? string.Empty
        };
    }
}
