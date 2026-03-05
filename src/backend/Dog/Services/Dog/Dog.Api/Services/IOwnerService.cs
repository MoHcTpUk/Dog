using Dog.Contracts.Commands.Owner;
using Dog.Contracts.Dtos;
using Dog.Contracts.Queries;
using Shared.Api.Services;

namespace Dog.Api.Services;

public interface IOwnerService
    : IService<CreateOwnerCommand, UpdateOwnerCommand, DeleteOwnerCommand, OwnerQuery, OwnerDto>;
