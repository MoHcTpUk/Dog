using Shared.Api.Query;
using Shared.Dtos;
using Users.Contracts.Dtos;

namespace Users.Contracts.Queries;

public class UserQuery : Query<ResultContainer<UserDto>>
{
    public List<Guid>? Ids { get; set; }

    public string? Name { get; set; }
}
