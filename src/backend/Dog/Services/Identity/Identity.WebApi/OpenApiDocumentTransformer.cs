using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Models;

namespace Identity.WebApi;

public class OpenApiDocumentTransformer : IOpenApiDocumentTransformer
{
    public Task TransformAsync(OpenApiDocument document, OpenApiDocumentTransformerContext context, CancellationToken cancellationToken)
    {
        OpenApiConfiguration.TransformDocument(document);
        return Task.CompletedTask;
    }
}
