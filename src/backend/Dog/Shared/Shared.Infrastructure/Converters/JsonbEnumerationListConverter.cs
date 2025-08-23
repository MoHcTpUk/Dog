using System.Text.Json;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Shared.Infrastructure.Converters;

public class JsonbEnumerationListConverter<TEnum>(ConverterMappingHints? hints = null)
    : ValueConverter<List<TEnum>, string>(v => JsonSerializer.Serialize(v, new JsonSerializerOptions
        {
            Converters = { new EnumerationJsonConverter<TEnum>() }
        }),
        v => JsonSerializer.Deserialize<List<TEnum>>(v, new JsonSerializerOptions
        {
            Converters = { new EnumerationJsonConverter<TEnum>() }
        }) ?? new List<TEnum>(),
        hints)
    where TEnum : Enumeration<TEnum>;