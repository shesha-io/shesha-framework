using Abp.Dependency;
using Abp.Runtime.Caching;
using Shesha.Cache;

namespace Shesha.Authentication.JwtBearer
{
    /// <summary>
    /// Token blacklist cache holder
    /// </summary>
    public class TokenBlacklistCacheHolder : CacheHolder<string, bool>, ITokenBlacklistCacheHolder, ISingletonDependency
    {
        public TokenBlacklistCacheHolder(ICacheManager cacheManager) : base("token-blacklist", cacheManager)
        {
        }
    }
}
