using Abp.Dependency;
using NHibernate.Intercept;
using NHibernate.Proxy;
using NHibernate.Proxy.DynamicProxy;
using Shesha.Services;
using System;
using System.Linq;

namespace Shesha.NHibernate
{
    /// <summary>
    /// NHibernate proxy stripper
    /// </summary>
    public class NhibernateProxyStripper : IProxyStripper, ITransientDependency
    {
        public Type StripProxy(Type type)
        {
            #pragma warning disable 612, 618
            if (type.GetInterfaces().Any(i => i == typeof(INHibernateProxy) || i == typeof(IProxy) || i == typeof(IFieldInterceptorAccessor)) && type.BaseType != null)
            {
                return type.BaseType;
            }
            #pragma warning restore 612, 618
            return type;
        }

        public T Unproxy<T>(T entity) where T : class
        {
            if (entity is INHibernateProxy proxy)
            {
                return (T)proxy.HibernateLazyInitializer.GetImplementation();
            }
            return entity;
        }
    }
}
