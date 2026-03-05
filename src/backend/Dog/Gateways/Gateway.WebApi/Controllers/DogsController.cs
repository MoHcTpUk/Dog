using Dog.Contracts.Commands.Dog;
using Dog.Contracts.Dtos;
using Dog.Contracts.Queries;
using Dog.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Shared.Api;
using Shared.Dtos;
using Shared.Enumeration;

namespace Gateway.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class DogsController(IDogService service)
    : AbstractController<IDogService, ResultContainer<DogDto>, CreateDogCommand, UpdateDogCommand, DeleteDogCommand,
        DogQuery, DogDto>(service)
{
    [HttpPost(nameof(Create))]
    public new Task<ResultContainer<DogDto>> Create([FromBody] CreateDogCommand command)
    {
        return base.Create(command);
    }

    [HttpPut(nameof(Update))]
    public new Task<ResultContainer<DogDto>> Update([FromBody] UpdateDogCommand command)
    {
        return base.Update(command);
    }

    [HttpDelete(nameof(Delete))]
    public new Task<ResultContainer<DogDto>> Delete([FromBody] DeleteDogCommand command)
    {
        return base.Delete(command);
    }

    [HttpGet(nameof(Get))]
    public new Task<ResultContainer<DogDto>> Get([FromQuery] DogQuery query)
    {
        return base.Get(query);
    }

    [HttpPost("BindToOwner")]
    public Task<ResultContainer<DogDto>> BindToOwner([FromBody] BindDogToOwnerCommand command)
    {
        return service.BindToOwnerAsync(command);
    }

    [HttpPost("UnbindFromOwner")]
    public Task<ResultContainer<DogDto>> UnbindFromOwner([FromBody] UnbindDogFromOwnerCommand command)
    {
        return service.UnbindFromOwnerAsync(command);
    }
    
    [HttpGet("AllSpecies")]
    public ResultContainer<EnumerationDto> GetAllSpecies()
    {
        var items = Species.GetAll()
            .Select(s => new EnumerationDto(s.Value, s.Name))
            .ToList();

        return new ResultContainer<EnumerationDto>
        {
            Items = items
        };
    }
}