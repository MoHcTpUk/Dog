using Dog.Api.Dtos;
using Shared.Api.Query;
using Shared.Dtos;

namespace Dog.Api.Queries;

public class DogQuery : Query<ResultContainer<DogDto>>
{
    public List<Guid>? Ids { get; set; }

    public string? Name { get; set; }
}
