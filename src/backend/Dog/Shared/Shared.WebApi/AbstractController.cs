using Microsoft.AspNetCore.Mvc;
using Shared.Api.Commands;
using Shared.Api.Query;
using Shared.Api.Services;
using Shared.Dtos;

namespace Shared.Api;

[ApiController]
[Route("[controller]")]
public abstract class AbstractController<TService, TResultContainer, TCreateCommand, TUpdateCommand, TDeleteCommand,
    TQuery, TDto>(
    IService<TCreateCommand, TUpdateCommand, TDeleteCommand, TQuery, TDto> service) : ControllerBase
    where TCreateCommand : CreateCommand<ResultContainer<TDto>>
    where TUpdateCommand : UpdateCommand<ResultContainer<TDto>>
    where TDeleteCommand : DeleteCommand<ResultContainer<TDto>>
    where TQuery : Query<ResultContainer<TDto>>
    where TDto : Dto
{
    protected async Task<ResultContainer<TDto>> Create([FromBody] TCreateCommand command)
    {
        var result = await service.CreateAsync(command);
        return result;
    }

    protected async Task<ResultContainer<TDto>> Update([FromBody] TUpdateCommand command)
    {
        var result = await service.UpdateAsync(command);
        return result;
    }

    protected async Task<ResultContainer<TDto>> Delete([FromBody] TDeleteCommand command)
    {
        var result = await service.DeleteAsync(command);
        return result;
    }

    protected async Task<ResultContainer<TDto>> Get([FromQuery] TQuery query)
    {
        var result = await service.GetAsync(query);
        return result;
    }
}