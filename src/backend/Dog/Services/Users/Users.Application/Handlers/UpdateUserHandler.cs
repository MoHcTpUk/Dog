using AutoMapper;
using Shared.Application.Handlers;
using Users.Api.Commands.User;
using Users.Api.Dtos;
using Users.Application.Interfaces;
using Users.Domain.Aggregates;

namespace Users.Application.Handlers;

public class UpdateUserHandler(IUserRepository repository, IMapper mapper)
    : UpdateAggregateHandler<UserAggregate, UserDto, UpdateUserCommand>(repository, mapper);