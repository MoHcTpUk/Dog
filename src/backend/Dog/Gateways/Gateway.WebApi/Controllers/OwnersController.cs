using Dog.Contracts.Commands.Owner;
using Dog.Contracts.Dtos;
using Dog.Contracts.Queries;
using Dog.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Shared.Api;
using Shared.Dtos;

namespace Gateway.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class OwnersController(IOwnerService service)
    : AbstractController<IOwnerService, ResultContainer<OwnerDto>, CreateOwnerCommand, UpdateOwnerCommand,
        DeleteOwnerCommand, OwnerQuery, OwnerDto>(service)
{
    [HttpPost(nameof(Create))]
    public new Task<ResultContainer<OwnerDto>> Create([FromBody] CreateOwnerCommand command)
    {
        return base.Create(command);
    }

    [HttpPut(nameof(Update))]
    public new Task<ResultContainer<OwnerDto>> Update([FromBody] UpdateOwnerCommand command)
    {
        return base.Update(command);
    }

    [HttpDelete(nameof(Delete))]
    public new Task<ResultContainer<OwnerDto>> Delete([FromBody] DeleteOwnerCommand command)
    {
        return base.Delete(command);
    }

    [HttpGet(nameof(Get))]
    public new Task<ResultContainer<OwnerDto>> Get([FromQuery] OwnerQuery query)
    {
        return base.Get(query);
    }
}