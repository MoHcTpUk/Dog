using Owner.Api.Commands.Owner;
using Owner.Api.Dtos;
using Owner.Api.Queries;
using Shared.Api.Services;

namespace Owner.Api.Services;

public interface IOwnerService
    : IService<CreateOwnerCommand, UpdateOwnerCommand, DeleteOwnerCommand, OwnerQuery, OwnerDto>;
