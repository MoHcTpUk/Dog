using Shared.Api.Services;
using Shared.Messaging.Messaging;
using Users.Api.Commands.RegistrationRequest;
using Users.Api.Commands.User;
using Users.Api.Dtos;
using Users.Api.Queries;

namespace Users.Api.Services;

public class UserService(ICommandBus commandBus)
    : Service<CreateUserCommand, UpdateUserCommand, DeleteUserCommand, UserQuery, UserDto>(commandBus), IUserService
{
    private readonly ICommandBus _commandBus = commandBus;

    public async Task<RegistrationRequestDto> CreateRegistrationRequest(CreateRegistrationRequestCommand command)
    {
        var result =
            await _commandBus.SendAsync<CreateRegistrationRequestCommand, RegistrationRequestDto>(
                command, Subject);

        return result;
    }

    public async Task<BearerTokenDto> VerifyRegistrationRequest(VerifyRegistrationRequestCommand command)
    {
        var result =
            await _commandBus.SendAsync<VerifyRegistrationRequestCommand, BearerTokenDto>(
                command, Subject);

        return result;
    }
}