using Shesha.Reflection;
using System;
using System.Reflection;

namespace Shesha.Extensions
{
    public static class TypeExtensions
    {
        /// <summary>
        /// Check if the type is SheshaDynamicCrudAppService (implement IDynamicCrudAppService)
        /// </summary>
        /// <param name="type"></param>
        /// <returns></returns>
        public static bool IsSheshaDynamicCrudAppService(this Type type)
        {
            return type.ImplementsGenericInterface(typeof(IDynamicCrudAppService<,,>));
        }

        /// <summary>
        /// Get base generic type for this type
        /// </summary>
        /// <param name="type"></param>
        /// <param name="baseGenericType"></param>
        /// <returns></returns>
        public static Type? FindBaseGenericType(this Type type, Type baseGenericType)
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
        /// Return <see cref="Type.FullName"/> of the specified <paramref name="assembly"/>. Throws exception if it's null or empty
        /// </summary>
        public static string GetRequiredFullName(this Assembly assembly)
        {
            return !string.IsNullOrWhiteSpace(assembly.FullName)
                ? assembly.FullName
                : throw new Exception($"{nameof(assembly.FullName)} is empty");
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
