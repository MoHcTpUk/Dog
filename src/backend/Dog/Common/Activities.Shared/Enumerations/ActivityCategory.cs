using Shared;

namespace Activities.Shared.Enumerations;

public class ActivityCategory : Enumeration<ActivityCategory>
{
    public static readonly ActivityCategory Other = new(0, "Other");
    public static readonly ActivityCategory Sport = new(1, "Sport");
    public static readonly ActivityCategory Culture = new(2, "Culture");

    public ActivityCategory()
    {
    }

    private ActivityCategory(int value, string name) : base(value, name)
    {
    }
}