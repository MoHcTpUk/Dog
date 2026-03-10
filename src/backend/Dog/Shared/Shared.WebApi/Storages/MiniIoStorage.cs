using Minio;
using Minio.DataModel.Args;
using Minio.Exceptions;
using Shared.Dtos;

namespace Shared.Api.Storages;

public class MiniIoStorage(IConfiguration config) : IStorage
{
    private readonly string _bucketName = "uploads";

    private readonly IMinioClient _minioClient = new MinioClient()
        .WithEndpoint(config["Minio:Endpoint"])
        .WithCredentials(config["Minio:AccessKey"], config["Minio:SecretKey"])
        .Build();

    public async Task UploadFileAsync(Guid fileId, Stream stream, string contentType, string fileName)
    {
        var exists = await _minioClient.BucketExistsAsync(new BucketExistsArgs().WithBucket(_bucketName));
        if (!exists) await _minioClient.MakeBucketAsync(new MakeBucketArgs().WithBucket(_bucketName));

        var safeFileName = Path.GetFileName(fileName);
        var fileExtension = Path.GetExtension(safeFileName);
        var headers = new Dictionary<string, string>
        {
            ["x-amz-meta-file-name"] = safeFileName,
            ["x-amz-meta-file-extension"] = fileExtension
        };

        await _minioClient.PutObjectAsync(new PutObjectArgs()
            .WithBucket(_bucketName)
            .WithObject(fileId.ToString())
            .WithStreamData(stream)
            .WithObjectSize(stream.Length)
            .WithHeaders(headers)
            .WithContentType(contentType));
    }

    public async Task<FileDownloadResult> DownloadFileAsync(Guid fileId)
    {
        try
        {
            var ms = new MemoryStream();
            var stat = await _minioClient.StatObjectAsync(new StatObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(fileId.ToString()));

            await _minioClient.GetObjectAsync(new GetObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(fileId.ToString())
                .WithCallbackStream(stream => stream.CopyTo(ms)));

            ms.Position = 0;

            return new FileDownloadResult
            {
                Stream = ms,
                FileName = GetMetadataValue(stat.MetaData, "x-amz-meta-file-name"),
                FileExtension = GetMetadataValue(stat.MetaData, "x-amz-meta-file-extension"),
                ContentType = stat.ContentType
            };
        }
        catch (MinioException)
        {
            Console.WriteLine($"File {fileId} not found");
            throw;
        }
    }

    public async Task DeleteFileAsync(Guid fileId)
    {
        await _minioClient.RemoveObjectAsync(new RemoveObjectArgs()
            .WithBucket(_bucketName)
            .WithObject(fileId.ToString()));
    }

    private static string? GetMetadataValue(IDictionary<string, string>? metadata, string key)
    {
        if (metadata is null)
            return null;

        if (metadata.TryGetValue(key, out var exactValue))
            return exactValue;

        var match = metadata.FirstOrDefault(pair => string.Equals(pair.Key, key, StringComparison.OrdinalIgnoreCase));
        return string.IsNullOrWhiteSpace(match.Key) ? null : match.Value;
    }
}