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
    private readonly ICommandBus _commandBus = commandBus;

    protected override string Subject => MessagingSubject.DogService;

    public async Task<ResultContainer<DogDto>> BindToOwnerAsync(BindDogToOwnerCommand command)
    {
        var result = await _commandBus.SendAsync<BindDogToOwnerCommand, ResultContainer<DogDto>>(command, Subject);
        if (result is null)
            throw new Exception($"Failed to process command {nameof(BindDogToOwnerCommand)}");
        return result;
    }

    public async Task<ResultContainer<DogDto>> UnbindFromOwnerAsync(UnbindDogFromOwnerCommand command)
    {
        var result = await _commandBus.SendAsync<UnbindDogFromOwnerCommand, ResultContainer<DogDto>>(command, Subject);
        if (result is null)
            throw new Exception($"Failed to process command {nameof(UnbindDogFromOwnerCommand)}");
        return result;
    }

    public async Task<ResultContainer<DogDto>> AddPhotoAsync(AddDogPhotoCommand command)
    {
        var result = await _commandBus.SendAsync<AddDogPhotoCommand, ResultContainer<DogDto>>(command, Subject);
        if (result is null)
            throw new Exception($"Failed to process command {nameof(AddDogPhotoCommand)}");
        return result;
    }

    public async Task<ResultContainer<DogDto>> RemovePhotoAsync(RemoveDogPhotoCommand command)
    {
        var result = await _commandBus.SendAsync<RemoveDogPhotoCommand, ResultContainer<DogDto>>(command, Subject);
        if (result is null)
            throw new Exception($"Failed to process command {nameof(RemoveDogPhotoCommand)}");
        return result;
    }
}