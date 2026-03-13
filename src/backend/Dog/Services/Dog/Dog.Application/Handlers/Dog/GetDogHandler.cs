using System.Linq;
using System.Linq.Expressions;
using AutoMapper;
using Dog.Contracts.Dtos;
using Dog.Contracts.Queries;
using Dog.Domain;
using Dog.Domain.Aggregates;
using Shared.Application.Handlers;

namespace Dog.Application.Handlers.Dog;

public class GetDogHandler(IDogRepository repository, IMapper mapper)
    : GetAggregateHandler<DogAggregate, DogDto, DogQuery>(repository, mapper)
{
    private static readonly DateOnly Today = DateOnly.FromDateTime(DateTime.UtcNow);

    protected override List<(Func<DogQuery, bool> Condition, Expression<Func<DogAggregate, bool>> Filter)>
        FilterExpression(DogQuery request)
    {
        return
        [
            (query => query.Ids != null, x => request.Ids!.Contains(x.Id)),
            (query => !string.IsNullOrWhiteSpace(query.Name), x => x.Name.Contains(request.Name!)),
            (query => query.Genders != null && query.Genders.Count != 0, x => request.Genders!.Contains(x.Gender)),
            (query => query.WeightFrom != null, x => x.Weight >= request.WeightFrom!.Value),
            (query => query.WeightTo != null, x => x.Weight <= request.WeightTo!.Value),
            (query => query.Species != null && query.Species.Count != 0, x => request.Species!.Any(s => s.Value == x.Species.Value)),
            (query => query.AgeFrom != null, x => (Today.Year - x.Birthdate.Year) - (Today.DayOfYear < x.Birthdate.DayOfYear ? 1 : 0) >= request.AgeFrom!.Value),
            (query => query.AgeTo != null, x => (Today.Year - x.Birthdate.Year) - (Today.DayOfYear < x.Birthdate.DayOfYear ? 1 : 0) <= request.AgeTo!.Value),
            (query => query.Activities != null && query.Activities.Count != 0, x => request.Activities!.Contains(x.Activity)),
            (query => !string.IsNullOrWhiteSpace(query.About), x => x.About != null && x.About.Contains(request.About!)),
            (query => query.OwnerIds != null && query.OwnerIds.Count != 0, x => x.OwnerId != null && request.OwnerIds!.Contains(x.OwnerId.Value))
        ];
    }
}