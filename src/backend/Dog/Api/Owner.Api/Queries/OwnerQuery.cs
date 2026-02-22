using Owner.Api.Dtos;
using Shared.Api.Query;
using Shared.Dtos;

namespace Owner.Api.Queries;

public class OwnerQuery : Query<ResultContainer<OwnerDto>>
{
    public List<Guid>? Ids { get; set; }

    public string? Name { get; set; }
}
