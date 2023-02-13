using System;
using System.Linq;

namespace Shesha.GraphQL
{
    public static class GraphQLSharedTypeExtensions
    {
        public static bool IsAssignableToGenericType(this Type givenType, Type genericType)
        {
            var interfaceTypes = givenType.GetInterfaces();

            if (interfaceTypes.Any(it => it.IsGenericType && it.GetGenericTypeDefinition() == genericType))
            {
                return true;
            }

            if (givenType.IsGenericType && givenType.GetGenericTypeDefinition() == genericType)
            {
                return true;
            }

            var baseType = givenType.BaseType;

            return baseType != null && IsAssignableToGenericType(baseType, genericType);
        }

        public static Type GetGenericTypeAssignableTo(this Type givenType, Type genericType)
        {
            var interfaceTypes = givenType.GetInterfaces();

            var type = interfaceTypes.FirstOrDefault(it =>
                it.IsGenericType && it.GetGenericTypeDefinition() == genericType);

            if (type != null)
            {
                return type;
            }

            type = givenType.GetGenericTypeDefinition();

            if (givenType.IsGenericType && type == genericType)
            {
                return type;
            }

            var baseType = givenType.BaseType;

            return baseType != null ? GetGenericTypeAssignableTo(baseType, genericType) : null;
        }
    }
}
