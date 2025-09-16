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
    IKeycloakClient keycloakClient
)
    : ICommandHandler<VerifyRegistrationRequestCommand, BearerTokenDto>
{
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

        var newKeycloakUser = new CreateKeycloakUserRequest
        {
            Username = $"user{Guid.NewGuid():N}",
            Email = registrationRequest.Email
        };

        var result = await keycloakClient.CreateUserAsync(newKeycloakUser);

        return new BearerTokenDto
        {
            AccessToken = string.Empty,
            ExpiresIn = 0,
            RefreshToken = string.Empty
        };
    }
}