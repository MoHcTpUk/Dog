using Dog.Api.Commands.Dog;
using Dog.Api.Dtos;
using Dog.Api.Queries;
using Dog.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Shared.Api;
using Shared.Dtos;

namespace Gateway.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class DogsController(IDogService service)
    : AbstractController<IDogService, ResultContainer<DogDto>, CreateDogCommand, UpdateDogCommand, DeleteDogCommand,
        DogQuery, DogDto>(service);
