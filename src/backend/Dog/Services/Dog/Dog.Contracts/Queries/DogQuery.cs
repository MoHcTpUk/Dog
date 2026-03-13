using Dog.Contracts.Dtos;
using Shared.Api.Query;
using Shared.Dtos;
using Shared.Enumeration;
using Shared.Enums;

namespace Dog.Contracts.Queries;

public class DogQuery : Query<ResultContainer<DogDto>>
{
    public List<Guid>? Ids { get; set; }

    public string? Name { get; set; }

    public List<Gender>? Genders { get; set; }

    public int? WeightFrom { get; set; }

    public int? WeightTo { get; set; }

    public List<Species>? Species { get; set; }

    public int? AgeFrom { get; set; }

    public int? AgeTo { get; set; }

    public List<Activity>? Activities { get; set; }

    public string? About { get; set; }

    public List<Guid>? OwnerIds { get; set; }
}
