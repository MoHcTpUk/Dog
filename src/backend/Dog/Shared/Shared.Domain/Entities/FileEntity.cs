using Shared.Domain.Interfaces;

namespace Shared.Domain.Entities;

public class FileEntity : IBaseModel
{
    public required Guid FileId { get; set; }
    public required string FileName { get; set; }

    public required string Extension { get; set; }

    public required string ContentType { get; set; }
}