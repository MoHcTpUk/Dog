namespace Shared.Dtos;

public record FileDownloadResult
{
    public required Stream Stream { get; set; }

    public string? FileName { get; set; }

    public string? FileExtension { get; set; }

    public string? ContentType { get; set; }
}