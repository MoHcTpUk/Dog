using Dog.Api.Commands.Dog;
using Dog.Api.Dtos;
using Dog.Api.Queries;
using Shared.Api.Services;
using Shared.Messaging.Messaging;

namespace Dog.Api.Services;

public class DogService(ICommandBus commandBus)
    : Service<CreateDogCommand, UpdateDogCommand, DeleteDogCommand, DogQuery, DogDto>(commandBus), IDogService
    {
        protected override string Subject => MessagingSubject.DogService;
    };