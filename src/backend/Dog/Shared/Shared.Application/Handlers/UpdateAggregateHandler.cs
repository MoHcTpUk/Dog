using AutoMapper;
using Shared.Api.Commands;
using Shared.Domain;
using Shared.Domain.Interfaces;
using Shared.Dtos;
using Shared.Messaging.Interfaces;

namespace Shared.Application.Handlers;

public abstract class UpdateAggregateHandler<TAggregate, TDto, TUpdateCommand>(
    IRepository<TAggregate> repository,
    IMapper mapper)
    : ICommandHandler<TUpdateCommand, ResultContainer<TDto>>
    where TAggregate : IBaseModel
    where TDto : Dto
    where TUpdateCommand : UpdateCommand<ResultContainer<TDto>>
{
    public async Task<ResultContainer<TDto>> Handle(TUpdateCommand command,
        CancellationToken cancellationToken = default)
    {
        var aggregate = await repository.GetAsync(command.Id, CancellationToken.None);

        if (aggregate == null) throw new Exception($"Aggregate with id {command.Id} not found");

        mapper.Map(command, aggregate);

        var result = repository.UpdateAsync(new List<TAggregate> { aggregate });

        await repository.SaveChangesAsync();

        var dto = mapper.Map<TDto>(result.First());

        var resultContainer = new ResultContainer<TDto>
        {
            Items = [dto]
        };

        return resultContainer;
    }
}