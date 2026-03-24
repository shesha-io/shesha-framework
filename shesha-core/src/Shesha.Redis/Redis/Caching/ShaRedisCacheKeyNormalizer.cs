using Abp.Dependency;
using Abp.Runtime.Session;
using Microsoft.Extensions.Options;

namespace Shesha.Redis.Caching
{
    public class ShaRedisCacheKeyNormalizer : IShaRedisCacheKeyNormalizer, ITransientDependency
    {
        public IAbpSession AbpSession { get; set; }
        protected ShaRedisCacheOptions RedisCacheOptions { get; }

        public ShaRedisCacheKeyNormalizer(
        IOptions<ShaRedisCacheOptions> redisCacheOptions)
        {
            AbpSession = NullAbpSession.Instance;
            RedisCacheOptions = redisCacheOptions.Value;
        }

        public string NormalizeKey(ShaRedisCacheKeyNormalizeArgs args)
        {
            var normalizedKey = $"n:{args.CacheName},c:{RedisCacheOptions.KeyPrefix}{args.Key}";

            if (args.MultiTenancyEnabled && AbpSession.TenantId != null && RedisCacheOptions.TenantKeyEnabled)
            {
                normalizedKey = $"t:{AbpSession.TenantId},{normalizedKey}";
            }

            return normalizedKey;
        }
    }
}
