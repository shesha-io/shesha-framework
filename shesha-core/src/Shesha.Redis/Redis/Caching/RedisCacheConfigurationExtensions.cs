using Abp.Dependency;
using Abp.RealTime;
using Abp.Runtime.Caching;
using Abp.Runtime.Caching.Configuration;
using Shesha.Redis.Caching.RealTime;

namespace Shesha.Redis.Caching
{
    /// <summary>
    /// Extension methods for <see cref="ICachingConfiguration"/>.
    /// </summary>
    public static class RedisCacheConfigurationExtensions
    {
        /// <summary>
        /// Configures caching to use Redis as cache server.
        /// </summary>
        /// <param name="cachingConfiguration">The caching configuration.</param>
        public static void UseRedis(this ICachingConfiguration cachingConfiguration)
        {
            cachingConfiguration.UseRedis(options => { });
        }

        /// <summary>
        /// Configures caching to use Redis as cache server.
        /// </summary>
        /// <param name="cachingConfiguration">The caching configuration.</param>
        /// <param name="optionsAction">Ac action to get/set options</param>
        public static void UseRedis(this ICachingConfiguration cachingConfiguration, Action<ShaRedisCacheOptions> optionsAction)
        {
            var iocManager = cachingConfiguration.AbpConfiguration.IocManager;

            iocManager.RegisterIfNot<ICacheManager, ShaRedisCacheManager>();
            iocManager.RegisterIfNot<IOnlineClientStore, RedisOnlineClientStore>();
            
            optionsAction(iocManager.Resolve<ShaRedisCacheOptions>());
        }
    }
}
