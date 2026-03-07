using Shared.Api.Services;
using Users.Contracts.Commands.AuthorizationRequest;
using Users.Contracts.Commands.RegistrationRequest;
using Users.Contracts.Commands.User;
using Users.Contracts.Dtos;
using Users.Contracts.Queries;

namespace Users.Api.Services;

public interface IUserService : IService<CreateUserCommand, UpdateUserCommand, DeleteUserCommand, UserQuery, UserDto>
{
    Task<RegistrationRequestDto> CreateAuthorizationRequest(CreateAuthorizationRequestCommand requestCommand);

    Task<UserDto> VerifyAuthorizationRequest(VerifyAuthorizationRequestCommand requestCommand);

    Task<RegistrationRequestDto> CreateRegistrationRequest(CreateRegistrationRequestCommand requestCommand);

    Task<UserDto> VerifyRegistrationRequest(VerifyRegistrationRequestCommand requestCommand);
}