using Abp.Dependency;
using Abp.Runtime.Caching;
using Shesha.Cache;
using Shesha.Otp.Dto;
using System;

namespace Shesha.Otp
{
    /// <summary>
    /// OTP cache
    /// </summary>
    public class OtpCache : CacheHolder<Guid, OtpDto>, IOtpCache, ISingletonDependency
    {
        public OtpCache(ICacheManager cacheManager) : base("OneTimePinsCache", cacheManager)
        {
        }
    }
}
