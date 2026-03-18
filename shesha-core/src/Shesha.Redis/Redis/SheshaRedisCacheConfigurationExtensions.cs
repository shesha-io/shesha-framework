using Abp.Dependency;
using Abp.Runtime.Caching.Configuration;
using Abp.Runtime.Caching.Redis;
using Castle.MicroKernel.Registration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Shesha.Configuration;
using Shesha.Locks;
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
        public static void UseSheshaRedis(this ICachingConfiguration cachingConfiguration, Action<AbpRedisCacheOptions> optionsAction)
        {
            var iocManager = cachingConfiguration.AbpConfiguration.IocManager;

            cachingConfiguration.UseRedis(options => {
                var sheshaOptions = GetRedisOptions(iocManager);
                options.ConnectionString = sheshaOptions.ConnectionString;
                /*
                if (sheshaOptions.DatabaseId != null)
                    options.DatabaseId = sheshaOptions.DatabaseId.Value;
                */
                options.DatabaseId = sheshaOptions.DatabaseId ?? 0;

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
                DatabaseId = sheshaRedisSection.GetValue<int?>(DatabaseIdKey)
            };
        }

        private class RedisOptions
        {
            public string? ConnectionString { get; set; }
            public int? DatabaseId { get; set; }
        }
    }
}
