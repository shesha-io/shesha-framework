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
    }
}
