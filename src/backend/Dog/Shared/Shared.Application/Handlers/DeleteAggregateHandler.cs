using AutoMapper;
using Shared.Api.Commands;
using Shared.Domain.Interfaces;
using Shared.Dtos;
using Shared.Messaging.Interfaces;

namespace Shared.Application.Handlers;

public abstract class DeleteAggregateHandler<TAggregate, TDto, TDeleteCommand>(
    IRepository<TAggregate> repository,
    IMapper mapper)
    : ICommandHandler<TDeleteCommand, ResultContainer<TDto>>
    where TAggregate : IBaseModel
    where TDto : Dto
    where TDeleteCommand : DeleteCommand<ResultContainer<TDto>>
{
    public async Task<ResultContainer<TDto>> Handle(TDeleteCommand request,
        CancellationToken cancellationToken = default)
    {
        var aggregate = await repository.GetAsync(request.Id, CancellationToken.None);

        if (aggregate == null) throw new Exception($"Aggregate with id {request.Id} not found");

        var result = repository.DeleteAsync(new List<TAggregate> { aggregate });

        await repository.SaveChangesAsync();

        var dto = mapper.Map<TDto>(result.First());

        var resultContainer = new ResultContainer<TDto>
        {
            Items = [dto]
        };

        return resultContainer;
    }
}