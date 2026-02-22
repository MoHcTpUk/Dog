using System.Linq.Expressions;
using AutoMapper;
using Owner.Api.Dtos;
using Owner.Api.Queries;
using Owner.Domain.Aggregates;
using Owner.Infrastructure.Repositories;
using Shared.Application.Handlers;

namespace Owner.Application.Handlers;

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
