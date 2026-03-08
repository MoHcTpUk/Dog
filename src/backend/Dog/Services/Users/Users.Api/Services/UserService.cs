using Shared.Api.Services;
using Shared.Messaging.Messaging;
using Users.Contracts.Commands.AuthRequest;
using Users.Contracts.Commands.User;
using Users.Contracts.Dtos;
using Users.Contracts.Queries;

namespace Users.Api.Services;

public class UserService(ICommandBus commandBus)
    : Service<CreateUserCommand, UpdateUserCommand, DeleteUserCommand, UserQuery, UserDto>(commandBus), IUserService
{
    protected override string Subject => MessagingSubject.UserService;

    private readonly ICommandBus _commandBus = commandBus;

    public async Task<AuthRequestDto> CreateAuthRequest(CreateAuthRequestCommand command)
    {
        var result =
            await _commandBus.SendAsync<CreateAuthRequestCommand, AuthRequestDto>(
                command, Subject);
        
        if (result is null)
            throw new InvalidOperationException("Auth request could not be created.");

        return result;
    }

    public async Task<UserDto> VerifyAuthRequest(VerifyAuthRequestCommand command)
    {
        var result =
            await _commandBus.SendAsync<VerifyAuthRequestCommand, UserDto>(
                command, Subject);

        if (result is null)
            throw new InvalidOperationException("Auth request could not be verified.");

        return result;
    }
}