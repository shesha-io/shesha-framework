using Abp.Dependency;
using Abp.Runtime.Caching.Configuration;
using Castle.MicroKernel.Registration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Shesha.Configuration;
using Shesha.Locks;
using Shesha.Redis.Caching;
using Shesha.Redis.Locking;
using Shesha.Reflection;
using System.Configuration;

namespace Shesha.Redis
{
    /// <summary>
    /// Extension methods for <see cref="ICachingConfiguration"/>.
    /// </summary>
    public static class SheshaRedisCacheConfigurationExtensions
    {
        private const string SheshaRedisSection = "SheshaRedis";
        private const string ConnectionStringKey = "ConnectionString";
        private const string DatabaseIdKey = "DatabaseId";
        private const string L1EnabledKey = "L1Enabled";
        private const string L1ExpirationSecondsKey = "L1ExpirationSeconds";
        private const string L1MaxEntriesPerCacheKey = "L1MaxEntriesPerCache";
        private const string L1InvalidationBroadcastEnabledKey = "L1InvalidationBroadcastEnabled";

        /// <summary>
        /// Configures caching to use Redis as cache server if it's configured on appsettings. 
        /// Example of configuration in appsettings.json:
        /// "SheshaRedis": {
        ///	    "ConnectionString": "localhost:6379"
        ///	    "DatabaseId": 1
        ///	}
        ///	Example of configuration using environment variables:
        ///	SheshaRedis__ConnectionString=localhost:6379
        ///	SheshaRedis__DatabaseId=1
        ///
        /// The in-process L1 cache is on by default and configurable through the same section:
        ///	SheshaRedis__L1Enabled=false
        ///	SheshaRedis__L1ExpirationSeconds=30
        ///	SheshaRedis__L1MaxEntriesPerCache=10000
        ///	SheshaRedis__L1InvalidationBroadcastEnabled=true
        /// </summary>
        /// <param name="cachingConfiguration">The caching configuration.</param>
        public static void UseSheshaRedisIfConfigured(this ICachingConfiguration cachingConfiguration)
        {
            var iocManager = cachingConfiguration.AbpConfiguration.IocManager;
            var options = GetRedisOptions(iocManager);
            if (!string.IsNullOrWhiteSpace(options.ConnectionString))
                cachingConfiguration.UseSheshaRedis(options => { });
        }

        /// <summary>
        /// Configures caching to use Redis as cache server.
        /// </summary>
        /// <param name="cachingConfiguration">The caching configuration.</param>
        public static void UseSheshaRedis(this ICachingConfiguration cachingConfiguration)
        {
            cachingConfiguration.UseSheshaRedis(options => { });
        }

        /// <summary>
        /// Configures caching to use Redis as cache server.
        /// </summary>
        /// <param name="cachingConfiguration">The caching configuration.</param>
        /// <param name="optionsAction">An action to get/set options</param>
        public static void UseSheshaRedis(this ICachingConfiguration cachingConfiguration, Action<ShaRedisCacheOptions> optionsAction)
        {
            var iocManager = cachingConfiguration.AbpConfiguration.IocManager;

            cachingConfiguration.UseRedis(options => {
                var sheshaOptions = GetRedisOptions(iocManager);
                options.ConnectionString = sheshaOptions.ConnectionString ?? "";
                options.DatabaseId = sheshaOptions.DatabaseId ?? 0;

                // L1 settings are optional; leaving them unset keeps the defaults on
                // ShaRedisCacheOptions rather than zeroing them.
                if (sheshaOptions.L1Enabled.HasValue)
                    options.L1Enabled = sheshaOptions.L1Enabled.Value;
                if (sheshaOptions.L1ExpirationSeconds.HasValue)
                    options.L1ExpirationSeconds = sheshaOptions.L1ExpirationSeconds.Value;
                if (sheshaOptions.L1MaxEntriesPerCache.HasValue)
                    options.L1MaxEntriesPerCache = sheshaOptions.L1MaxEntriesPerCache.Value;
                if (sheshaOptions.L1InvalidationBroadcastEnabled.HasValue)
                    options.L1InvalidationBroadcastEnabled = sheshaOptions.L1InvalidationBroadcastEnabled.Value;

                optionsAction.Invoke(options);
                
                if (string.IsNullOrWhiteSpace(options.ConnectionString))
                    throw new ConfigurationErrorsException($"Redis connection string is not defined in the options.");

                var factoryHolder = iocManager.Resolve<ILockFactoryHolder>();
                factoryHolder.CreateLockFactory(options.ConnectionString, options.DatabaseId);

                iocManager.IocContainer.Register(
                    Component.For<ILockFactory>()
                        .UsingFactoryMethod(kernel => factoryHolder.LockFactory.NotNull("Redis lock factory is not initialized."))
                        .IsDefault()
                );
            });
        }

        private static RedisOptions GetRedisOptions(IIocManager iocManager) 
        {
            var env = iocManager.Resolve<IWebHostEnvironment>();
            var configuration = env.GetAppConfiguration();

            var sheshaRedisSection = configuration.GetSection(SheshaRedisSection);
            return new RedisOptions
            {
                ConnectionString = sheshaRedisSection.GetValue<string>(ConnectionStringKey),
                DatabaseId = sheshaRedisSection.GetValue<int?>(DatabaseIdKey),
                L1Enabled = sheshaRedisSection.GetValue<bool?>(L1EnabledKey),
                L1ExpirationSeconds = sheshaRedisSection.GetValue<int?>(L1ExpirationSecondsKey),
                L1MaxEntriesPerCache = sheshaRedisSection.GetValue<int?>(L1MaxEntriesPerCacheKey),
                L1InvalidationBroadcastEnabled = sheshaRedisSection.GetValue<bool?>(L1InvalidationBroadcastEnabledKey),
            };
        }

        private class RedisOptions
        {
            public string? ConnectionString { get; set; }
            public int? DatabaseId { get; set; }
            public bool? L1Enabled { get; set; }
            public int? L1ExpirationSeconds { get; set; }
            public int? L1MaxEntriesPerCache { get; set; }
            public bool? L1InvalidationBroadcastEnabled { get; set; }
        }
    }
}
