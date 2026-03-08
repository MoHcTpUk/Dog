using Shared.Application;
using Users.Contracts.Commands.AuthRequest;
using Users.Contracts.Commands.User;
using Users.Contracts.Dtos;
using Users.Domain.Aggregates;

namespace Users.Application;

public class MappingProfile : BaseMappingProfile
{
    public MappingProfile()
    {
        CreateMap<CreateUserCommand, UserAggregate>();
        CreateMap<UpdateUserCommand, UserAggregate>();
        CreateMap<UserAggregate, UserDto>();

        CreateMap<CreateAuthRequestCommand, AuthRequest>();
        CreateMap<AuthRequest, AuthRequestDto>()
            .ForMember(item => item.VerificationCode, cfg => cfg.MapFrom(src => src.ActivationCode));
    }
}