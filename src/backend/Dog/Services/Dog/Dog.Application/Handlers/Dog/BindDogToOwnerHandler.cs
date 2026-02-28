using AutoMapper;
using Dog.Api.Commands.Dog;
using Dog.Api.Dtos;
using Dog.Infrastructure.Repositories;
using MediatR;
using Shared.Dtos;

namespace Dog.Application.Handlers.Dog;

public class BindDogToOwnerHandler(IDogRepository dogRepository, IOwnerRepository ownerRepository, IMapper mapper)
    : IRequestHandler<BindDogToOwnerCommand, ResultContainer<DogDto>>
{
    public async Task<ResultContainer<DogDto>> Handle(BindDogToOwnerCommand request, CancellationToken cancellationToken)
    {
        var dog = await dogRepository.GetAsync(request.DogId, cancellationToken);
        if (dog == null)
            throw new InvalidOperationException($"Собака с id {request.DogId} не найдена.");

        var owner = await ownerRepository.GetAsync(request.OwnerId, cancellationToken);
        if (owner == null)
            throw new InvalidOperationException($"Хозяин с id {request.OwnerId} не найден.");

        dog.OwnerId = request.OwnerId;
        dogRepository.UpdateAsync([dog]);
        await dogRepository.SaveChangesAsync();

        var dto = mapper.Map<DogDto>(dog);
        return new ResultContainer<DogDto> { Items = [dto] };
    }
}
