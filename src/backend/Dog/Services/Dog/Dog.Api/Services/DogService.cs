using Dog.Contracts.Commands.Dog;
using Dog.Contracts.Dtos;
using Dog.Contracts.Queries;
using Shared.Api.Services;
using Shared.Dtos;
using Shared.Messaging.Messaging;

namespace Dog.Api.Services;

public class DogService(ICommandBus commandBus)
    : Service<CreateDogCommand, UpdateDogCommand, DeleteDogCommand, DogQuery, DogDto>(commandBus), IDogService
{
    protected override string Subject => MessagingSubject.DogService;

    public async Task<ResultContainer<DogDto>> BindToOwnerAsync(BindDogToOwnerCommand command)
    {
        var result = await commandBus.SendAsync<BindDogToOwnerCommand, ResultContainer<DogDto>>(command, Subject);
        if (result is null)
            throw new Exception($"Failed to process command {nameof(BindDogToOwnerCommand)}");
        return result;
    }

    public async Task<ResultContainer<DogDto>> UnbindFromOwnerAsync(UnbindDogFromOwnerCommand command)
    {
        var result = await commandBus.SendAsync<UnbindDogFromOwnerCommand, ResultContainer<DogDto>>(command, Subject);
        if (result is null)
            throw new Exception($"Failed to process command {nameof(UnbindDogFromOwnerCommand)}");
        return result;
    }
}