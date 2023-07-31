using Abp.Dependency;
using Castle.DynamicProxy;
using System;
using System.Linq;

namespace Shesha.Services
{
    /// <summary>
    /// Castle.Core proxy stripper
    /// </summary>
    public class CastleProxyStripper : IProxyStripper, ITransientDependency
    {
        public Type StripProxy(Type type)
        {
            #pragma warning disable 612, 618
            if (type.GetInterfaces().Any(i => i == typeof(IProxyTargetAccessor)))
            {
                return type.BaseType;
            }
            #pragma warning restore 612, 618
            return type;
        }
    }
}
