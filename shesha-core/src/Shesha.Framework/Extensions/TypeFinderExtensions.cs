using Abp.Reflection;
using Shesha.Modules;
using System;

namespace Shesha.Extensions
{
    /// <summary>
    /// Type finder extensions
    /// </summary>
    public static class TypeFinderExtensions
    {
        /// <summary>
        /// Find module types (subclasses of <see cref="SheshaModule"/>)
        /// </summary>
        /// <param name="typeFinder"></param>
        /// <returns></returns>
        public static Type[] FindModuleTypes(this ITypeFinder typeFinder)
        {
            return typeFinder.Find(type => type != null && type.IsPublic && !type.IsGenericType && !type.IsAbstract && type != typeof(SheshaModule) && typeof(SheshaModule).IsAssignableFrom(type));
        }
    }
}
