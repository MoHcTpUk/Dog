using Microsoft.EntityFrameworkCore;
using Shared.Messaging.Interfaces;
using Users.Api.Commands.RegistrationRequest;
using Users.Api.Dtos;
using Users.Application.Interfaces;
using Users.Application.Models.Keycloak;
using Users.Infrastructure.Repositories;

namespace Users.Application.Handlers;

public class VerifyRegistrationRequestHandler(
    IRegistrationRequestRepository registrationRequestRepository,
    IKeycloakClient keycloakClient,
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

        var newKeycloakUser = new CreateKeycloakUserRequest
        {
            Username = username,
            Email = registrationRequest.Email
        };

        var userId = await keycloakClient.CreateUserAsync(newKeycloakUser);

        await keycloakClient.SetUserPasswordAsync(userId, password);

        var tokenResponse = await keycloakClient.GetUserTokenAsync(username, password);


        return new BearerTokenDto
        {
            AccessToken = tokenResponse.AccessToken,
            ExpiresIn = tokenResponse.ExpiresIn,
            RefreshToken = tokenResponse.RefreshToken ?? string.Empty
        };
    }
}