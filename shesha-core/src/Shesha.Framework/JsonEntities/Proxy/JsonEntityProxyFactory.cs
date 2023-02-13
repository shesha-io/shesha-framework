using Abp.Dependency;
using Castle.Core.Logging;
using Castle.DynamicProxy;
using Newtonsoft.Json.Linq;
using System;

namespace Shesha.JsonEntities.Proxy
{
    public class JsonEntityProxyFactory : IJsonEntityProxyFactory, ISingletonDependency
    {
        private readonly IProxyGenerator _proxyGenerator;
        private readonly IInterceptor _interceptor;

        public JsonEntityProxyFactory(IJsonEntityInterceptor interceptor)
        {
            _proxyGenerator = new ProxyGenerator();
            _interceptor = interceptor;
        }

        public virtual object GetNewProxiedJsonEntity(Type objectType, JObject jObj)
        {
            var obj = Activator.CreateInstance(objectType);
            var p = new ProxyGenerationOptions();
            p.AddMixinInstance(new JsonEntityProxy(jObj, this));
            return _proxyGenerator.CreateClassProxyWithTarget(objectType, obj, p, _interceptor);
        }
    }
}
