using AutoMapper;
using Shared.Application.Handlers;
using Users.Contracts.Commands.User;
using Users.Contracts.Dtos;
using Users.Application.Interfaces;
using Users.Domain.Aggregates;

namespace Users.Application.Handlers;

public class CreateUserHandler(IUserRepository userRepository, IMapper mapper)
    : CreateAggregateHandler<UserAggregate, UserDto, CreateUserCommand>(userRepository, mapper);