// using System.Reflection;
// using System.Text.Json;
// using System.Text.Json.Serialization;
//
// namespace Shared;
//
// public class EnumerationJsonConverter<TEnum> : JsonConverter<TEnum>
//     where TEnum : Enumeration<TEnum>
// {
//     private static readonly MethodInfo? FromValueMethod = typeof(TEnum).GetMethod(
//         "FromValue",
//         BindingFlags.Public | BindingFlags.Static,
//         [typeof(int)]);
//
//     private static readonly MethodInfo? FromValueWithNameMethod = typeof(TEnum).GetMethod(
//         "FromValue",
//         BindingFlags.Public | BindingFlags.Static,
//         [typeof(int), typeof(string)]);
//
//     public override TEnum Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
//     {
//         if (reader.TokenType == JsonTokenType.Number)
//             return FromValue(reader.GetInt32());
//
//         if (reader.TokenType != JsonTokenType.StartObject)
//             throw new JsonException($"{typeof(TEnum).Name} must be number or object with value/name.");
//
//         int? value = null;
//         string? name = null;
//
//         while (reader.Read())
//         {
//             if (reader.TokenType == JsonTokenType.EndObject)
//                 break;
//
//             if (reader.TokenType != JsonTokenType.PropertyName)
//                 continue;
//
//             var propertyName = reader.GetString();
//             reader.Read();
//
//             if (string.Equals(propertyName, "value", StringComparison.OrdinalIgnoreCase))
//             {
//                 value = reader.GetInt32();
//                 continue;
//             }
//
//             if (string.Equals(propertyName, "name", StringComparison.OrdinalIgnoreCase))
//                 name = reader.GetString();
//         }
//
//         if (value is null)
//             throw new JsonException($"{typeof(TEnum).Name} value is required.");
//
//         return string.IsNullOrWhiteSpace(name)
//             ? FromValue(value.Value)
//             : FromValue(value.Value, name!);
//     }
//
//     public override void Write(Utf8JsonWriter writer, TEnum value, JsonSerializerOptions options)
//     {
//         writer.WriteNumberValue(value.Value);
//     }
//
//     private static TEnum FromValue(int value)
//     {
//         if (FromValueMethod is null)
//             throw new InvalidOperationException(
//                 $"{typeof(TEnum).Name} must expose public static FromValue(int).");
//
//         return (TEnum)FromValueMethod.Invoke(null, [value])!;
//     }
//
//     private static TEnum FromValue(int value, string name)
//     {
//         if (FromValueWithNameMethod is null)
//             return FromValue(value);
//
//         return (TEnum)FromValueWithNameMethod.Invoke(null, [value, name])!;
//     }
// }