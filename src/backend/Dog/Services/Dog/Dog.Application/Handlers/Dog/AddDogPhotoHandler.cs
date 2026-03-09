using AutoMapper;
using Dog.Contracts.Commands.Dog;
using Dog.Contracts.Dtos;
using Dog.Domain;
using MediatR;
using Shared.Dtos;

namespace Dog.Application.Handlers.Dog;

public class AddDogPhotoHandler(IDogRepository dogRepository, IMapper mapper)
    : IRequestHandler<AddDogPhotoCommand, ResultContainer<DogDto>>
{
    public async Task<ResultContainer<DogDto>> Handle(AddDogPhotoCommand request, CancellationToken cancellationToken)
    {
        var dog = await dogRepository.GetAsync(request.DogId, cancellationToken);
        if (dog == null)
            throw new InvalidOperationException($"Собака с id {request.DogId} не найдена.");

        if (!dog.PhotoIds.Contains(request.PhotoId))
            dog.PhotoIds.Add(request.PhotoId);

        dogRepository.UpdateAsync([dog]);
        await dogRepository.SaveChangesAsync();

        var dto = mapper.Map<DogDto>(dog);
        return new ResultContainer<DogDto> { Items = [dto] };
    }
}
