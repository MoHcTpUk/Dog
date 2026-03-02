using System.Text;
using AutoMapper;
using Shared.Messaging.Interfaces;
using Users.Api.Commands.RegistrationRequest;
using Users.Api.Dtos;
using Users.Domain.Aggregates;
using Users.Infrastructure.Repositories;

namespace Users.Application.Handlers;

public class CreateRegistrationRequestHandler(
    IRegistrationRequestRepository registrationRequestRepository,
    IMapper mapper)
    : ICommandHandler<CreateRegistrationRequestCommand, RegistrationRequestDto>
{
    private const int VerificationCodeLength = 4;

    public async Task<RegistrationRequestDto> Handle(CreateRegistrationRequestCommand requestCommand,
        CancellationToken cancellationToken)
    {
        var activationCodeBuilder = new StringBuilder();
        var random = new Random();
        for (var i = 0; i < VerificationCodeLength; i++) activationCodeBuilder.Append(random.Next(10));
        var activationCode = activationCodeBuilder.ToString();

        var registrationRequest = new RegistrationRequest
        {
            Email = requestCommand.Email,
            ActivationCode = activationCode,
            Id = Guid.Empty
        };

        var result =
            await registrationRequestRepository.CreateAsync(new List<RegistrationRequest> { registrationRequest },
                CancellationToken.None);

        await registrationRequestRepository.SaveChangesAsync();

        var dto = mapper.Map<RegistrationRequestDto>(result.First());

        return dto;
    }
}