using Owner.Api.Commands.Owner;
using Owner.Api.Dtos;
using Owner.Api.Queries;
using Owner.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Shared.Api;
using Shared.Dtos;

namespace Gateway.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class OwnersController(IOwnerService service)
    : AbstractController<IOwnerService, ResultContainer<OwnerDto>, CreateOwnerCommand, UpdateOwnerCommand,
        DeleteOwnerCommand, OwnerQuery, OwnerDto>(service);
