using AutoMapper;
using Shared.Application.Handlers;
using Users.Api.Commands.User;
using Users.Api.Dtos;
using Users.Domain.Aggregates;
using Users.Infrastructure.Repositories;

namespace Users.Application.Handlers;

public class DeleteUserHandler(IUserRepository repository, IMapper mapper)
    : DeleteAggregateHandler<UserAggregate, UserDto, DeleteUserCommand>(repository, mapper);