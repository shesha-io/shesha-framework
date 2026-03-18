using Abp.Runtime.Caching.Redis;
using StackExchange.Redis;

namespace Shesha.Redis
{
    public class SheshaRedisCacheSerializer: DefaultRedisCacheSerializer
    {
        public override RedisValue Serialize(object value, Type type)
        {
            try
            {
                return base.Serialize(value, type);
            }
            catch
            {
                throw;
            }
        }
    }
}
