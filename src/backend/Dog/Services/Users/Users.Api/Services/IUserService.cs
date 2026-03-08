using Shared.Api.Services;
using Users.Contracts.Commands.AuthRequest;
using Users.Contracts.Commands.User;
using Users.Contracts.Dtos;
using Users.Contracts.Queries;

namespace Users.Api.Services;

public interface IUserService : IService<CreateUserCommand, UpdateUserCommand, DeleteUserCommand, UserQuery, UserDto>
{
    Task<AuthRequestDto> CreateAuthRequest(CreateAuthRequestCommand requestCommand);

    Task<UserDto> VerifyAuthRequest(VerifyAuthRequestCommand requestCommand);
}