using Dog.Api.Commands.Dog;
using Dog.Api.Commands.Owner;
using Dog.Api.Dtos;
using Dog.Domain.Aggregates;
using Shared.Application;
using DomainActivity = Shared.Enums.Activity;
using DomainGender = Shared.Enums.Gender;
using DomainSpecies = Shared.Enumeration.Species;

namespace Dog.Application;

public class MappingProfile : BaseMappingProfile
{
    public MappingProfile()
    {
        CreateMap<CreateDogCommand, DogAggregate>();
        CreateMap<UpdateDogCommand, DogAggregate>();
        CreateMap<DogAggregate, DogDto>();

        CreateMap<DomainGender, DomainGender>().ConvertUsing(x => x);
        CreateMap<DomainSpecies, DomainSpecies>().ConvertUsing(x => x);
        CreateMap<DomainActivity, DomainActivity>().ConvertUsing(x => x);

        CreateMap<DomainGender, DomainGender>().ConvertUsing(x => x);
        CreateMap<DomainSpecies, DomainSpecies>().ConvertUsing(x => x);
        CreateMap<DomainActivity, DomainActivity>().ConvertUsing(x => x);
        
        CreateMap<CreateOwnerCommand, OwnerAggregate>();
        CreateMap<UpdateOwnerCommand, OwnerAggregate>();
        CreateMap<OwnerAggregate, OwnerDto>();
    }
}