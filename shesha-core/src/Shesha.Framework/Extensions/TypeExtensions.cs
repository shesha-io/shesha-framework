using System;

namespace Shesha.Extensions
{
    public static class TypeExtensions
    {
        public static object GetTypeDefaultValue(this Type type)
        {
            if (type == null)
                throw new ArgumentNullException("type");

            return
                type.IsValueType
                    ? Activator.CreateInstance(type) //value type
                    : null; //reference type
        }

        public static Type FindBaseGenericType(this Type type, Type baseGenericType)
        {
            var btype = type;
            while (btype != null && (!btype.IsGenericType || btype.GetGenericTypeDefinition() != baseGenericType))
            {
                btype = btype.BaseType;
            }

            return btype;
        }

    }
}
