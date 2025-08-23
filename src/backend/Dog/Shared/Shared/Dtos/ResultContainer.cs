namespace Shared.Dtos;

public class ResultContainer<TDto> where TDto : Dto
{
    public List<TDto> Items { get; set; } = [];
}