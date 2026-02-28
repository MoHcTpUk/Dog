namespace Shared.Enumeration;

public sealed class Species : Enumeration<Species>
{
    public static readonly Species Unknown = new(0, nameof(Unknown));
    public static readonly Species Labrador = new(1, nameof(Labrador));
    public static readonly Species Shepherd = new(2, nameof(Shepherd));
    public static readonly Species Bulldog = new(3, nameof(Bulldog));
    public static readonly Species Poodle = new(4, nameof(Poodle));
    public static readonly Species Terrier = new(5, nameof(Terrier));
    public static readonly Species Husky = new(6, nameof(Husky));
    public static readonly Species Other = new(99, nameof(Other));

    public Species() : base(Unknown.Value, Unknown.Name)
    {
    }

    private Species(int value, string name) : base(value, name)
    {
    }
}