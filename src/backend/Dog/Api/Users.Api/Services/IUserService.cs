using Shared.Api.Services;
using Users.Api.Commands.RegistrationRequest;
using Users.Api.Commands.User;
using Users.Api.Dtos;
using Users.Api.Queries;

namespace Users.Api.Services;

public interface IUserService : IService<CreateUserCommand, UpdateUserCommand, DeleteUserCommand, UserQuery, UserDto>
{
    Task<RegistrationRequestDto> CreateRegistrationRequest(CreateRegistrationRequestCommand requestCommand);

    Task<BearerTokenDto> VerifyRegistrationRequest(VerifyRegistrationRequestCommand requestCommand);
}