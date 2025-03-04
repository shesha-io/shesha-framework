using Shesha.Exceptions;
using System;

namespace Shesha.Extensions
{
    /// <summary>
    /// Activator helper. Extends static <see cref="Activator"/> class
    /// </summary>
    public static class ActivatorHelper
    {

        /// <summary>
        /// Create new instance of type <paramref name="type"/>
        /// </summary>
        /// <exception cref="ActivatorException"></exception>
        public static object CreateNotNullObject(Type type) 
        {
            return Activator.CreateInstance(type) ?? throw new ActivatorException(type);
        }

        /// <summary>
        /// Create new instance of type <paramref name="type"/>
        /// </summary>
        /// <exception cref="ActivatorException"></exception>
        public static object CreateNotNullObject(Type type, params object?[]? args)
        {
            return Activator.CreateInstance(type, args) ?? throw new ActivatorException(type);
        }

        /// <summary>
        /// Create new instance of type <typeparamref name="T"/>
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <exception cref="ActivatorException"></exception>
        public static T CreateNotNullInstance<T>() where T : class
        {
            return Activator.CreateInstance<T>() ?? throw new ActivatorException(typeof(T));
        }
    }
}
