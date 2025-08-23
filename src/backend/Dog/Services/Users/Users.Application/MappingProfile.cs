using Shared.Application;
using Users.Api.Commands.User;
using Users.Api.Dtos;
using Users.Domain.Aggregates;

namespace Users.Application;

public class MappingProfile : BaseMappingProfile
{
    public MappingProfile()
    {
        CreateMap<CreateUserCommand, UserAggregate>();
        CreateMap<UpdateUserCommand, UserAggregate>();
        CreateMap<UserAggregate, UserDto>();
    }
}