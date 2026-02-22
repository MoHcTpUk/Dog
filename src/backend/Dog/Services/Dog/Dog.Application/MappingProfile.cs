using Dog.Api.Commands.Dog;
using Dog.Api.Dtos;
using Dog.Domain.Aggregates;
using Shared.Application;
using DomainActivity = Dog.Domain.Enums.Activity;
using DomainGender = Dog.Domain.Enums.Gender;
using DomainSpecies = Dog.Domain.Enums.Species;

namespace Dog.Application;

public class MappingProfile : BaseMappingProfile
{
    public MappingProfile()
    {
        CreateMap<CreateDogCommand, DogAggregate>();
        CreateMap<UpdateDogCommand, DogAggregate>();
        CreateMap<DogAggregate, DogDto>();

        CreateMap<DomainGender, Dog.Api.Dtos.Gender>().ConvertUsing(x => (Dog.Api.Dtos.Gender)x);
        CreateMap<DomainSpecies, Dog.Api.Dtos.Species>().ConvertUsing(x => (Dog.Api.Dtos.Species)x);
        CreateMap<DomainActivity, Dog.Api.Dtos.Activity>().ConvertUsing(x => (Dog.Api.Dtos.Activity)x);

        CreateMap<Dog.Api.Dtos.Gender, DomainGender>().ConvertUsing(x => (DomainGender)x);
        CreateMap<Dog.Api.Dtos.Species, DomainSpecies>().ConvertUsing(x => (DomainSpecies)x);
        CreateMap<Dog.Api.Dtos.Activity, DomainActivity>().ConvertUsing(x => (DomainActivity)x);
    }
}
