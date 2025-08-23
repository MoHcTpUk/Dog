using System.Reflection;

namespace Shared;

public abstract class Enumeration<TEnum>(int value, string name) : IEquatable<Enumeration<TEnum>>
    where TEnum : Enumeration<TEnum>
{
    public Enumeration() : this(0, string.Empty)
    {
    }

    public int Value { get; } = value;
    public string Name { get; protected set; } = name;

    public bool Equals(Enumeration<TEnum>? other)
    {
        if (other is null)
            return false;

        return Value == other.Value;
    }

    public static TEnum FromValue(int value)
    {
        var matchingItem = GetAll().FirstOrDefault(item => item.Value == value);
        if (matchingItem == null)
            throw new InvalidOperationException($"No {typeof(TEnum).Name} with value {value}");
        return matchingItem;
    }

    public static IEnumerable<TEnum> GetAll()
    {
        return typeof(TEnum)
            .GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.DeclaredOnly)
            .Select(f => f.GetValue(null))
            .Cast<TEnum>();
    }

    public override bool Equals(object? obj)
    {
        return Equals(obj as Enumeration<TEnum>);
    }

    public override int GetHashCode()
    {
        return Value.GetHashCode();
    }

    public override string ToString()
    {
        return Name;
    }
}