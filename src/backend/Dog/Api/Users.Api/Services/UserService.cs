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

    public Task CreateRegistrationRequest(CreateRegistrationRequest request)
    {
        _commandBus.SendAsync(request, Subject);
        
        return Task.CompletedTask;
    }
}