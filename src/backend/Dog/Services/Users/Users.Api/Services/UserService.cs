using Shared.Api.Services;
using Shared.Messaging.Messaging;
using Users.Contracts.Commands.AuthorizationRequest;
using Users.Contracts.Commands.RegistrationRequest;
using Users.Contracts.Commands.User;
using Users.Contracts.Dtos;
using Users.Contracts.Queries;

namespace Users.Api.Services;

public class UserService(ICommandBus commandBus)
    : Service<CreateUserCommand, UpdateUserCommand, DeleteUserCommand, UserQuery, UserDto>(commandBus), IUserService
{
    protected override string Subject => MessagingSubject.UserService;

    private readonly ICommandBus _commandBus = commandBus;

    public async Task<RegistrationRequestDto> CreateAuthorizationRequest(CreateAuthorizationRequestCommand command)
    {
        var result =
            await _commandBus.SendAsync<CreateAuthorizationRequestCommand, RegistrationRequestDto>(
                command, Subject);

        if (result is null)
            throw new InvalidOperationException("Authorization request could not be created.");

        return result;
    }

    public async Task<UserDto> VerifyAuthorizationRequest(VerifyAuthorizationRequestCommand command)
    {
        var result =
            await _commandBus.SendAsync<VerifyAuthorizationRequestCommand, UserDto>(
                command, Subject);

        if (result is null)
            throw new InvalidOperationException("User could not be authorized.");

        return result;
    }

    public async Task<RegistrationRequestDto> CreateRegistrationRequest(CreateRegistrationRequestCommand command)
    {
        var result =
            await _commandBus.SendAsync<CreateRegistrationRequestCommand, RegistrationRequestDto>(
                command, Subject);
        
        if (result is null)
            throw new InvalidOperationException("Registration request could not be created.");

        return result;
    }

    public async Task<UserDto> VerifyRegistrationRequest(VerifyRegistrationRequestCommand command)
    {
        var result =
            await _commandBus.SendAsync<VerifyRegistrationRequestCommand, UserDto>(
                command, Subject);

        if (result is null)
            throw new InvalidOperationException("User could not be verified.");

        return result;
    }
}