using Owner.Api.Commands.Owner;
using Owner.Api.Dtos;
using Owner.Domain.Aggregates;
using Shared.Application;

namespace Owner.Application;

public class MappingProfile : BaseMappingProfile
{
    public MappingProfile()
    {
        CreateMap<CreateOwnerCommand, OwnerAggregate>();
        CreateMap<UpdateOwnerCommand, OwnerAggregate>();
        CreateMap<OwnerAggregate, OwnerDto>();
    }
}
