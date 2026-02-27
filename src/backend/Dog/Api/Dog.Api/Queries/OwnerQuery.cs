using Dog.Api.Dtos;
using Shared.Api.Query;
using Shared.Dtos;

namespace Dog.Api.Queries;

public class OwnerQuery : Query<ResultContainer<OwnerDto>>
{
    public List<Guid>? Ids { get; set; }

    public string? Name { get; set; }
}
