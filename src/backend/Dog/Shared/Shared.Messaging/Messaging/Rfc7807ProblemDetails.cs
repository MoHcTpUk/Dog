namespace Shared.Messaging.Messaging;

/// <summary>
/// RFC 7807 Problem Details (application/problem+json).
/// Minimal shape compatible with ASP.NET ProblemDetails/ValidationProblemDetails.
/// </summary>
public sealed class Rfc7807ProblemDetails
{
    public string? Type { get; init; }
    public string? Title { get; init; }
    public int? Status { get; init; }
    public string? Detail { get; init; }
    public string? Instance { get; init; }

    // Common validation shape (like ValidationProblemDetails.Errors in ASP.NET).
    public Dictionary<string, string[]>? Errors { get; init; }

    // Extra fields (traceId, etc.).
    public Dictionary<string, object?>? Extensions { get; init; }
}

