using Shesha.Reflection;
using System;
using System.Reflection;

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


        /// <summary>
        /// Return <see cref="Type.FullName"/> of the specified <paramref name="type"/>. Throws exception if it's null or empty
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static string GetRequiredFullName(this Type type) 
        {
            return !string.IsNullOrWhiteSpace(type.FullName)
                ? type.FullName
                : throw new Exception($"{nameof(type.FullName)} is empty for type '{type.Name}' in namespace '{type.Namespace}'");
        }

        /// <summary>
        /// Return assembly fullname of the specified <paramref name="type"/>
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static string GetAssemblyFullName(this Type type) 
        {
            return type.Assembly.FullName.NotNull($"Assembly full name is null for type '{type.FullName}'");
        }
    }
}
