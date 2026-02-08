using System.Text.Json;

namespace Shared.Messaging.Messaging;

public sealed class NatsResponseEnvelope
{
    public bool Ok { get; init; }

    public JsonElement? Data { get; init; }

    public Rfc7807ProblemDetails? Problem { get; init; }

    public static NatsResponseEnvelope Success<T>(T data, JsonSerializerOptions jsonOptions)
    {
        return new NatsResponseEnvelope
        {
            Ok = true,
            Data = JsonSerializer.SerializeToElement(data, jsonOptions)
        };
    }

    public static NatsResponseEnvelope Failure(Rfc7807ProblemDetails problem)
    {
        return new NatsResponseEnvelope
        {
            Ok = false,
            Data = null,
            Problem = problem
        };
    }
}