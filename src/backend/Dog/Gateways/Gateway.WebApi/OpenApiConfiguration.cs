using Microsoft.OpenApi.Models;

namespace Gateway.Api;

public static class OpenApiConfiguration
{
    public static void TransformDocument(OpenApiDocument document)
    {
        document.Info = new OpenApiInfo
        {
            Title = "Gateway API",
            Version = "v1"
        };

        document.Components ??= new OpenApiComponents();
        document.Components.Schemas ??= new Dictionary<string, OpenApiSchema>();
        document.Components.Schemas.TryAdd("Rfc7807ProblemDetails", new OpenApiSchema
        {
            Type = "object",
            Properties = new Dictionary<string, OpenApiSchema>
            {
                { "type", new OpenApiSchema { Type = "string", Nullable = true } },
                { "title", new OpenApiSchema { Type = "string", Nullable = true } },
                { "status", new OpenApiSchema { Type = "integer", Format = "int32", Nullable = true } },
                { "detail", new OpenApiSchema { Type = "string", Nullable = true } },
                { "instance", new OpenApiSchema { Type = "string", Nullable = true } },
                {
                    "errors", new OpenApiSchema
                    {
                        Type = "object",
                        Nullable = true,
                        AdditionalProperties = new OpenApiSchema
                        {
                            Type = "array",
                            Items = new OpenApiSchema { Type = "string" }
                        }
                    }
                },
                {
                    "extensions", new OpenApiSchema
                    {
                        Type = "object",
                        Nullable = true,
                        AdditionalProperties = new OpenApiSchema()
                    }
                }
            }
        });

        foreach (var pathItem in document.Paths.Values)
        foreach (var operation in pathItem.Operations.Values)
            operation.Responses.TryAdd("500", new OpenApiResponse
            {
                Description = "Internal server error",
                Content = new Dictionary<string, OpenApiMediaType>
                {
                    ["application/problem+json"] = new()
                    {
                        Schema = Rfc7807SchemaRef()
                    }
                }
            });
    }

    private static OpenApiSchema Rfc7807SchemaRef()
    {
        return new OpenApiSchema
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.Schema,
                Id = "Rfc7807ProblemDetails"
            }
        };
    }
}