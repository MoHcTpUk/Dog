using System.Text;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Shared.Messaging.Interfaces;
using Users.Application.Interfaces;
using Users.Contracts.Commands.AuthorizationRequest;
using Users.Contracts.Dtos;
using Users.Domain.Aggregates;

namespace Users.Application.Handlers;

public class CreateAuthorizationRequestHandler(
    IRegistrationRequestRepository registrationRequestRepository,
    IUserRepository userRepository,
    IMapper mapper)
    : ICommandHandler<CreateAuthorizationRequestCommand, RegistrationRequestDto>
{
    private const int VerificationCodeLength = 4;

    public async Task<RegistrationRequestDto> Handle(CreateAuthorizationRequestCommand requestCommand,
        CancellationToken cancellationToken)
    {
        var userExists = await userRepository.AsQueryable()
            .AnyAsync(item => item.Email == requestCommand.Email, cancellationToken);

        if (!userExists)
            throw new Exception("User with this email does not exist.");

        var activationCodeBuilder = new StringBuilder();
        var random = new Random();
        for (var i = 0; i < VerificationCodeLength; i++) activationCodeBuilder.Append(random.Next(10));
        var activationCode = activationCodeBuilder.ToString();

        var authorizationRequest = new RegistrationRequest
        {
            Email = requestCommand.Email,
            ActivationCode = activationCode,
            Id = Guid.Empty
        };

        var result =
            await registrationRequestRepository.CreateAsync([authorizationRequest], cancellationToken);

        await registrationRequestRepository.SaveChangesAsync();

        var dto = mapper.Map<RegistrationRequestDto>(result.First());

        return dto;
    }
}
