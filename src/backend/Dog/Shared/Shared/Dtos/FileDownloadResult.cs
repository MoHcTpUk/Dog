namespace Shared.Dtos;

public record FileDownloadResult
{
    public Stream Stream { get; set; }
    // public string ContentType { get; set; }
}