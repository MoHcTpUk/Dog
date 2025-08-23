using System.Reflection;

namespace Shared;

public static class Utilities
{
    public static Type[] GetTypes(Type factoryInterfaceType)
    {
        var factoryTypes = AppDomain.CurrentDomain
            .GetAssemblies()
            .Where(a => !a.IsDynamic &&
                        a.GetName().Name != "Microsoft.GeneratedCode")
            .SelectMany(a =>
            {
                try
                {
                    return a.GetTypes();
                }
                catch (ReflectionTypeLoadException e)
                {
                    return e.Types.Where(t => t != null);
                }
            })
            .Where(t => t is { IsAbstract: false, IsInterface: false }) // исключаем абстрактные классы и интерфейсы
            .Where(t => t != null && t.GetInterfaces()
                .Any(i =>
                    i.IsGenericType && factoryInterfaceType.IsGenericTypeDefinition
                        ? i.GetGenericTypeDefinition() == factoryInterfaceType
                        : i == factoryInterfaceType))
            .Where(t => t != null)
            .Select(t => t!)
            .ToArray();

        return factoryTypes;
    }
}