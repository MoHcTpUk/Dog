using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Api.Services;

namespace Gateway.Api.Controllers;

[ApiController]
[Authorize]
[Microsoft.AspNetCore.Components.Route("[controller]")]
public class FileController(IFileStorageService fileStorageService) : ControllerBase
{
    [HttpGet(nameof(GetFile))]
    public async Task<IActionResult> GetFile(Guid fileId)
    {
        var result = await fileStorageService.DownloadFileAsync(fileId);
        var downloadName = result.FileName;

        if (string.IsNullOrWhiteSpace(downloadName))
            downloadName = $"{fileId}{result.FileExtension}";

        return File(result.Stream, result.ContentType ?? "application/octet-stream", downloadName);
    }
}