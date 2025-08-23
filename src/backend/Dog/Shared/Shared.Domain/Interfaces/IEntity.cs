namespace Shared.Domain.Interfaces;

public interface IEntity : IBaseModel
{
    public Guid Id { get; set; }
}