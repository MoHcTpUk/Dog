using System.Text;
using AutoMapper;
using Shared.Messaging.Interfaces;
using Users.Application.Interfaces;
using Users.Contracts.Commands.AuthRequest;
using Users.Contracts.Dtos;
using Users.Domain.Aggregates;

namespace Users.Application.Handlers;

public class CreateAuthRequestHandler(
    IRegistrationRequestRepository registrationRequestRepository,
    IMapper mapper)
    : ICommandHandler<CreateAuthRequestCommand, AuthRequestDto>
{
    private const int VerificationCodeLength = 4;

    public async Task<AuthRequestDto> Handle(CreateAuthRequestCommand requestCommand,
        CancellationToken cancellationToken)
    {
        var activationCodeBuilder = new StringBuilder();
        var random = new Random();
        for (var i = 0; i < VerificationCodeLength; i++) activationCodeBuilder.Append(random.Next(10));
        var activationCode = activationCodeBuilder.ToString();

        var authRequest = new RegistrationRequest
        {
            Email = requestCommand.Email,
            ActivationCode = activationCode,
            Id = Guid.Empty
        };

        var result =
            await registrationRequestRepository.CreateAsync([authRequest], cancellationToken);

        await registrationRequestRepository.SaveChangesAsync();

        var dto = mapper.Map<AuthRequestDto>(result.First());

        return dto;
    }
}
