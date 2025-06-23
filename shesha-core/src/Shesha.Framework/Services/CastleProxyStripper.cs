using Abp.Dependency;
using Castle.DynamicProxy;
using JetBrains.Annotations;
using System;
using System.Linq;

namespace Shesha.Services
{
    /// <summary>
    /// Castle.Core proxy stripper
    /// </summary>
    [UsedImplicitly]
    public class CastleProxyStripper : IProxyStripper, ITransientDependency
    {
        public Type StripProxy(Type type)
        {
            #pragma warning disable 612, 618
            if (type.GetInterfaces().Any(i => i == typeof(IProxyTargetAccessor)) && type.BaseType != null)
            {
                return type.BaseType;
            }
            #pragma warning restore 612, 618
            return type;
        }

        public T Unproxy<T>(T entity) where T : class
        {
            return entity;
        }
    }
}
