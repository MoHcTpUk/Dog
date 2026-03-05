using System.Linq.Expressions;
using AutoMapper;
using Shared.Application.Handlers;
using Users.Api.Dtos;
using Users.Api.Queries;
using Users.Application.Interfaces;
using Users.Domain.Aggregates;

namespace Users.Application.Handlers;

public class GetUserHandler(IUserRepository repository, IMapper mapper)
    : GetAggregateHandler<UserAggregate, UserDto, UserQuery>(repository, mapper)
{
    protected override List<(Func<UserQuery, bool>, Expression<Func<UserAggregate, bool>>)>
        FilterExpression(UserQuery request)
    {
        return
        [
            (query => query.Ids != null, x => request.Ids!.Contains(x.Id))
        ];
    }
}