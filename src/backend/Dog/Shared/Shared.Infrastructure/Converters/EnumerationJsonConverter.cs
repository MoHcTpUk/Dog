using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Shared.Infrastructure.Converters;

public class EnumerationJsonConverter<TEnum> : JsonConverter<TEnum>
    where TEnum : Enumeration<TEnum>
{
    public override TEnum Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetInt32();

        var method = typeof(Enumeration<TEnum>)
            .GetMethod("FromValue", BindingFlags.Public | BindingFlags.Static);

        if (method is null)
            throw new InvalidOperationException($"No FromValue method on {typeof(TEnum).Name}");

        var enumValue = (TEnum)method.Invoke(null, [value])!;

        return enumValue;
    }

    public override void Write(Utf8JsonWriter writer, TEnum value, JsonSerializerOptions options)
    {
        var property = value.GetType().GetProperty("Value");

        if (property is null)
            throw new InvalidOperationException($"No Value property on {typeof(TEnum).Name}");

        var val = (int)property.GetValue(value)!;

        writer.WriteNumberValue(val);
    }
}