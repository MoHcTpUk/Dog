using System.Linq.Expressions;
using AutoMapper;
using LinqKit;
using Microsoft.EntityFrameworkCore;
using Shared.Api.Query;
using Shared.Domain;
using Shared.Domain.Interfaces;
using Shared.Dtos;
using Shared.Infrastructure.Repository;
using Shared.Messaging.Interfaces;

namespace Shared.Application.Handlers;

public abstract class GetAggregateHandler<TAggregate, TDto, TQuery>(
    IRepository<TAggregate> repository,
    IMapper mapper)
    : ICommandHandler<TQuery, ResultContainer<TDto>>
    where TAggregate : IBaseModel
    where TDto : Dto
    where TQuery : Query<ResultContainer<TDto>>
{
    public async Task<ResultContainer<TDto>> Handle(TQuery request, CancellationToken cancellationToken = default)
    {
        var filter = FilterExpression(request)
            .Where(x => x.Condition(request))
            .Select(x => x.Filter)
            .Aggregate<Expression<Func<TAggregate, bool>>, Expression<Func<TAggregate, bool>>>(x => true,
                (current, filterExpression) => current.And(filterExpression));

        var aggregate = await repository.AsQueryable().Where(filter).ToListAsync(cancellationToken);

        var items = mapper.Map<List<TDto>>(aggregate);

        var resultContainer = new ResultContainer<TDto>
        {
            Items = items
        };

        return resultContainer;
    }

    protected abstract List<(Func<TQuery, bool> Condition, Expression<Func<TAggregate, bool>> Filter)>
        FilterExpression(TQuery request);
}