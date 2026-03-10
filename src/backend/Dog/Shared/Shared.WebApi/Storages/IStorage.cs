using Shared.Dtos;

namespace Shared.Api.Storages;

public interface IStorage
{
    Task UploadFileAsync(Guid fileId, Stream stream, string contentType, string fileName);

    public Task<FileDownloadResult> DownloadFileAsync(Guid fileId);

    public Task DeleteFileAsync(Guid fileId);
}