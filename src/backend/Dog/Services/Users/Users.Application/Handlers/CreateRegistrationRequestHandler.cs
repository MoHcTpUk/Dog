using Shared.Messaging.Interfaces;
using Users.Api.Commands.RegistrationRequest;
using Users.Application.Interfaces;
using Users.Application.Models.Keycloak;
using Users.Infrastructure.Repositories;

namespace Users.Application.Handlers;

public class CreateRegistrationRequestHandler(IUserRepository userRepository, IKeycloakClient keycloakClient)
    : ICommandHandler<CreateRegistrationRequest>
{
    public async Task Handle(CreateRegistrationRequest request, CancellationToken cancellationToken)
    {
        var userRequest = new CreateKeycloakUserRequest
        {
            Username = "testuser",
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            Enabled = true,
            EmailVerified = false,
            Credentials = new List<KeycloakCredential>
            {
                new()
                {
                    Type = "password",
                    Value = "password123",
                    Temporary = false
                }
            }
        };

        var userId = await keycloakClient.CreateUserAsync(userRequest);
    }
}