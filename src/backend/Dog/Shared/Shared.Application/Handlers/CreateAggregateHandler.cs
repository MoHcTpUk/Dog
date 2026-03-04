using AutoMapper;
using Shared.Api.Commands;
using Shared.Domain.Interfaces;
using Shared.Dtos;
using Shared.Messaging.Interfaces;

namespace Shared.Application.Handlers;

public abstract class CreateAggregateHandler<TAggregate, TDto, TCreateCommand>(
    IRepository<TAggregate> repository,
    IMapper mapper)
    : ICommandHandler<TCreateCommand, ResultContainer<TDto>>
    where TAggregate : IBaseModel
    where TDto : Dto
    where TCreateCommand : CreateCommand<ResultContainer<TDto>>
{
    public async Task<ResultContainer<TDto>> Handle(TCreateCommand request,
        CancellationToken cancellationToken = default)
    {
        var newAggregate = mapper.Map<TAggregate>(request);

        var result = await repository.CreateAsync(new List<TAggregate> { newAggregate }, CancellationToken.None);

        await repository.SaveChangesAsync();

        var dto = mapper.Map<TDto>(result.First());

        var resultContainer = new ResultContainer<TDto>
        {
            Items = [dto]
        };

        return resultContainer;
    }
}