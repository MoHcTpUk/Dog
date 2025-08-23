namespace Shared.Messaging.Messaging;

public class Envelope<T>
{
    public string Type => typeof(T).Name;
    public required T Data { get; init; }
}