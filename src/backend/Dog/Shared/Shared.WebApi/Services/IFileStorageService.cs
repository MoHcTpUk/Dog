using Shared.Dtos;

namespace Shared.Api.Services;

public interface IFileStorageService
{
    Task<FileUploadResult> UploadFileAsync(IFormFile file);

    Task<FileDownloadResult> DownloadFileAsync(Guid fileId);
}