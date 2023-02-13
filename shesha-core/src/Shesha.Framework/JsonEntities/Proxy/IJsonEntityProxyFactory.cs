using Newtonsoft.Json.Linq;
using System;

namespace Shesha.JsonEntities.Proxy
{
    public interface IJsonEntityProxyFactory
    {
        object GetNewProxiedJsonEntity(Type objectType, JObject jObj);
    }
}
