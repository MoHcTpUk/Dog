using System.Linq.Expressions;
using AutoMapper;
using Dog.Api.Dtos;
using Dog.Api.Queries;
using Dog.Domain.Aggregates;
using Dog.Infrastructure.Repositories;
using Shared.Application.Handlers;

namespace Dog.Application.Handlers;

public class GetDogHandler(IDogRepository repository, IMapper mapper)
    : GetAggregateHandler<DogAggregate, DogDto, DogQuery>(repository, mapper)
{
    protected override List<(Func<DogQuery, bool> Condition, Expression<Func<DogAggregate, bool>> Filter)>
        FilterExpression(DogQuery request)
    {
        return
        [
            (query => query.Ids != null, x => request.Ids!.Contains(x.Id)),
            (query => !string.IsNullOrWhiteSpace(query.Name), x => x.Name.Contains(request.Name!))
        ];
    }
}
