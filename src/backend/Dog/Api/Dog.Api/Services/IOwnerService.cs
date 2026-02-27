using Dog.Api.Commands.Owner;
using Dog.Api.Dtos;
using Dog.Api.Queries;
using Shared.Api.Services;

namespace Dog.Api.Services;

public interface IOwnerService
    : IService<CreateOwnerCommand, UpdateOwnerCommand, DeleteOwnerCommand, OwnerQuery, OwnerDto>;
