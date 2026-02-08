namespace Shared.Messaging.Messaging;

/// <summary>
/// Thrown when a remote service responded with RFC7807 problem details.
/// </summary>
public sealed class RemoteProblemDetailsException(Rfc7807ProblemDetails problem)
    : Exception(problem.Title ?? "Remote service error")
{
    public Rfc7807ProblemDetails Problem { get; } = problem;
}

