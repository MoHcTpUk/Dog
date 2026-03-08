namespace Shared.Messaging.Messaging;

public sealed class RequestValidationException(Dictionary<string, string[]> errors)
    : Exception("Request validation failed.")
{
    public Dictionary<string, string[]> Errors { get; } = errors;
}
