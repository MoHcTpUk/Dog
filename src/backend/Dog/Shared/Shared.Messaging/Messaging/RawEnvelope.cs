using System.Text.Json;

namespace Shared.Messaging.Messaging;

public class RawEnvelope
{
    public required string Type { get; set; }

    public JsonElement Data { get; set; }
}