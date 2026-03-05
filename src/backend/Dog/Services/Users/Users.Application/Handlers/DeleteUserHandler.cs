using AutoMapper;
using Shared.Application.Handlers;
using Users.Api.Commands.User;
using Users.Api.Dtos;
using Users.Application.Interfaces;
using Users.Domain.Aggregates;

namespace Users.Application.Handlers;

public class DeleteUserHandler(IUserRepository repository, IMapper mapper)
    : DeleteAggregateHandler<UserAggregate, UserDto, DeleteUserCommand>(repository, mapper);