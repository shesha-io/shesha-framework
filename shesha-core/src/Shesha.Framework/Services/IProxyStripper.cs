using System;

namespace Shesha.Services
{
    /// <summary>
    /// Proxy types stripper
    /// </summary>
    public interface IProxyStripper
    {
        /// <summary>
        /// Strip proxy type
        /// </summary>
        Type StripProxy(Type type);

        /// <summary>
        /// Unproxy object
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="entity"></param>
        /// <returns></returns>
        T Unproxy<T>(T entity) where T : class;
    }
}
