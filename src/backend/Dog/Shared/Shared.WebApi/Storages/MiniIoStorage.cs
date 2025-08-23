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

    public async Task UploadFileAsync(Guid fileId, Stream stream, string contentType)
    {
        var exists = await _minioClient.BucketExistsAsync(new BucketExistsArgs().WithBucket(_bucketName));
        if (!exists) await _minioClient.MakeBucketAsync(new MakeBucketArgs().WithBucket(_bucketName));

        await _minioClient.PutObjectAsync(new PutObjectArgs()
            .WithBucket(_bucketName)
            .WithObject(fileId.ToString())
            .WithStreamData(stream)
            .WithObjectSize(stream.Length)
            .WithContentType(contentType));
    }

    public async Task<FileDownloadResult> DownloadFileAsync(Guid fileId)
    {
        try
        {
            var ms = new MemoryStream();

            await _minioClient.GetObjectAsync(new GetObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(fileId.ToString())
                .WithCallbackStream(stream => stream.CopyTo(ms)));

            ms.Position = 0;

            return new FileDownloadResult
            {
                Stream = ms
                // ContentType = contentType
            };
        }
        catch (MinioException)
        {
            Console.WriteLine($"File {fileId} not found");
            throw;
        }
    }
}