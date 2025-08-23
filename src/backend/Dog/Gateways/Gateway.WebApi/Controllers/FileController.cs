using Microsoft.AspNetCore.Mvc;
using Shared.Api.Services;

namespace Gateway.Api.Controllers;

[ApiController]
[Microsoft.AspNetCore.Components.Route("[controller]")]
public class FileController(IFileStorageService fileStorageService) : ControllerBase
{
    [HttpGet(nameof(GetFile))]
    public async Task<IActionResult> GetFile(Guid fileId)
    {
        var result = await fileStorageService.DownloadFileAsync(fileId);

        return File(result.Stream, "application/octet-stream");
    }
}