using Shesha.Extensions;
using Shesha.JsonEntities.Proxy;

namespace Shesha.JsonEntities
{
    public static class JsonEntityExtensions
    {
        public static T? AsJsonEntity<T>(this object? jsonEntity) where T : class
        {
            if (jsonEntity == null)
                return null;

            if (jsonEntity is IJsonEntityProxy proxy)
                return JsonEntityProxy.GetJson(proxy).ToObject<T>();

            return jsonEntity.GetFullCopyViaJson<T>(); ;
        }
    }
}
