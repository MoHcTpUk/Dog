namespace Shared.Dtos;

public record FileDto
{
    public required Guid FileId { get; set; }
    public required string FileName { get; set; }

    public required string Extension { get; set; }

    public required string ContentType { get; set; }
}