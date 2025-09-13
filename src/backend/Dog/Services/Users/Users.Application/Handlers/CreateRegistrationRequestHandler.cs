using AutoMapper;
using Shared.Messaging.Interfaces;
using Users.Api.Commands.RegistrationRequest;
using Users.Infrastructure.Repositories;

namespace Users.Application.Handlers;

public class CreateRegistrationRequestHandler(IUserRepository userRepository, IMapper mapper)
    : ICommandHandler<CreateRegistrationRequest>
{
    public Task Handle(CreateRegistrationRequest request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}