using Shared.Api.Storages;
using Shared.Dtos;

namespace Shared.Api.Services;

public class FileStorageService(IStorage storage) : IFileStorageService
{
    public async Task<FileUploadResult> UploadFileAsync(IFormFile file)
    {
        var fileId = Guid.NewGuid();
        
        await using var stream = file.OpenReadStream();

        await storage.UploadFileAsync(fileId, stream, file.ContentType, file.FileName);

        return new FileUploadResult
        {
            FileName = file.FileName,
            Id = fileId,
            ContentType = file.ContentType
        };
    }

    public async Task<FileDownloadResult> DownloadFileAsync(Guid fileId)
    {
        var result = await storage.DownloadFileAsync(fileId);
        
        return result;
    }

    public async Task DeleteFileAsync(Guid fileId)
    {
        await storage.DeleteFileAsync(fileId);
    }
}