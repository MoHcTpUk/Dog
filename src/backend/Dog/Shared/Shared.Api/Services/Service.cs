using Shared.Api.Commands;
using Shared.Api.Query;
using Shared.Dtos;
using Shared.Messaging.Messaging;

namespace Shared.Api.Services;

public abstract class Service<TCreateCommand, TUpdateCommand, TDeleteCommand, TQuery, TDto>(
    ICommandBus commandBus)
    : IService<TCreateCommand, TUpdateCommand, TDeleteCommand, TQuery, TDto>
    where TCreateCommand : CreateCommand<ResultContainer<TDto>>
    where TUpdateCommand : UpdateCommand<ResultContainer<TDto>>
    where TDeleteCommand : DeleteCommand<ResultContainer<TDto>>
    where TQuery : Query<ResultContainer<TDto>>
    where TDto : Dto
{
    protected virtual string Subject => GetType().Name;

    public async Task<ResultContainer<TDto>> CreateAsync(TCreateCommand command)
    {
        var result = await commandBus.SendAsync<TCreateCommand, ResultContainer<TDto>>(command, Subject);

        if (result is null)
            throw new Exception(@$"Failed to process command {command.GetType().Name}");

        return result;
    }

    public async Task<ResultContainer<TDto>> UpdateAsync(TUpdateCommand command)
    {
        var result = await commandBus.SendAsync<TUpdateCommand, ResultContainer<TDto>>(command, Subject);

        if (result is null)
            throw new Exception(@$"Failed to process command {command.GetType().Name}");

        return result;
    }

    public async Task<ResultContainer<TDto>> DeleteAsync(TDeleteCommand command)
    {
        var result = await commandBus.SendAsync<TDeleteCommand, ResultContainer<TDto>>(command, Subject);

        if (result is null)
            throw new Exception(@$"Failed to process command {command.GetType().Name}");

        return result;
    }

    public async Task<ResultContainer<TDto>> GetAsync(TQuery query)
    {
        var result = await commandBus.SendAsync<TQuery, ResultContainer<TDto>>(query, Subject);

        if (result is null)
            throw new Exception(@$"Failed to process query {query.GetType().Name}");

        return result;
    }
}