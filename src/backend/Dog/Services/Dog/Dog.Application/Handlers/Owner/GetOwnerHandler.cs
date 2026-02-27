using System.Linq.Expressions;
using AutoMapper;
using Dog.Api.Dtos;
using Dog.Api.Queries;
using Dog.Domain.Aggregates;
using Dog.Infrastructure.Repositories;
using Shared.Application.Handlers;

namespace Dog.Application.Handlers.Owner;

public class GetOwnerHandler(IOwnerRepository repository, IMapper mapper)
    : GetAggregateHandler<OwnerAggregate, OwnerDto, OwnerQuery>(repository, mapper)
{
    protected override List<(Func<OwnerQuery, bool> Condition, Expression<Func<OwnerAggregate, bool>> Filter)>
        FilterExpression(OwnerQuery request)
    {
        return
        [
            (query => query.Ids != null, x => request.Ids!.Contains(x.Id)),
            (query => !string.IsNullOrWhiteSpace(query.Name), x => x.Name.Contains(request.Name!))
        ];
    }
}
