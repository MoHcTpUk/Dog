using AutoMapper;
using Dog.Api.Commands.Dog;
using Dog.Api.Dtos;
using Dog.Domain;
using MediatR;
using Shared.Dtos;

namespace Dog.Application.Handlers.Dog;

public class UnbindDogFromOwnerHandler(IDogRepository dogRepository, IMapper mapper)
    : IRequestHandler<UnbindDogFromOwnerCommand, ResultContainer<DogDto>>
{
    public async Task<ResultContainer<DogDto>> Handle(UnbindDogFromOwnerCommand request,
        CancellationToken cancellationToken)
    {
        var dog = await dogRepository.GetAsync(request.DogId, cancellationToken);
        if (dog == null)
            throw new InvalidOperationException($"Собака с id {request.DogId} не найдена.");

        dog.OwnerId = null;
        dogRepository.UpdateAsync([dog]);
        await dogRepository.SaveChangesAsync();

        var dto = mapper.Map<DogDto>(dog);
        return new ResultContainer<DogDto> { Items = [dto] };
    }
}