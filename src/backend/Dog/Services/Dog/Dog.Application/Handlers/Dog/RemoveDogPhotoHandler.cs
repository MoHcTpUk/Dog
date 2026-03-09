using AutoMapper;
using Dog.Contracts.Commands.Dog;
using Dog.Contracts.Dtos;
using Dog.Domain;
using MediatR;
using Shared.Dtos;

namespace Dog.Application.Handlers.Dog;

public class RemoveDogPhotoHandler(IDogRepository dogRepository, IMapper mapper)
    : IRequestHandler<RemoveDogPhotoCommand, ResultContainer<DogDto>>
{
    public async Task<ResultContainer<DogDto>> Handle(RemoveDogPhotoCommand request, CancellationToken cancellationToken)
    {
        var dog = await dogRepository.GetAsync(request.DogId, cancellationToken);
        if (dog == null)
            throw new InvalidOperationException($"Собака с id {request.DogId} не найдена.");

        dog.PhotoIds.Remove(request.PhotoId);

        dogRepository.UpdateAsync([dog]);
        await dogRepository.SaveChangesAsync();

        var dto = mapper.Map<DogDto>(dog);
        return new ResultContainer<DogDto> { Items = [dto] };
    }
}
