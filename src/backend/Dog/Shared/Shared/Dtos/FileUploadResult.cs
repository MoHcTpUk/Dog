namespace Shared.Dtos;

public record FileUploadResult
{
    public required Guid Id { get; set; }

    public required string FileName { get; set; }

    public required string ContentType { get; set; }
}