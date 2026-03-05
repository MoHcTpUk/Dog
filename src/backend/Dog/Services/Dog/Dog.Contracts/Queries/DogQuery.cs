using Dog.Contracts.Dtos;
using Shared.Api.Query;
using Shared.Dtos;

namespace Dog.Contracts.Queries;

public class DogQuery : Query<ResultContainer<DogDto>>
{
    public List<Guid>? Ids { get; set; }

    public string? Name { get; set; }
}
