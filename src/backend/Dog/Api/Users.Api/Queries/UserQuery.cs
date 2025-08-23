using Shared.Api.Query;
using Shared.Dtos;
using Users.Api.Dtos;

namespace Users.Api.Queries;

public class UserQuery : Query<ResultContainer<UserDto>>
{
    public List<Guid>? Ids { get; set; }

    public string? Name { get; set; }
}