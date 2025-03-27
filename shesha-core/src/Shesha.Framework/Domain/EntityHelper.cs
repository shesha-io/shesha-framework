using System;
using Abp.Dependency;
using Shesha.Configuration.Runtime;
using Shesha.Services;

namespace Shesha.Domain
{
    /// <summary>
    /// Entity Helper
    /// </summary>
    public static class EntityHelper
    {
        private static IEntityConfigurationStore? _configurationStore;

        private static IEntityConfigurationStore ConfigurationStore => _configurationStore ?? throw new Exception($"{nameof(IEntityConfigurationStore)} is unavailable");

        /// <summary>
        /// Refresh configuration store instance using provided <paramref name="iocManager"/>. Note: for internal usage and unit-tests only
        /// </summary>
        /// <param name="iocManager"></param>
        public static void RefreshStore(IIocManager iocManager)
        {
            _configurationStore = iocManager.IsRegistered<IEntityConfigurationStore>()
                ? iocManager.Resolve<IEntityConfigurationStore>()
                : null;
        }

        static EntityHelper()
        {
            RefreshStore(StaticContext.IocManager);
        }

        /// <summary>
        /// Get entity configuration by type short alias
        /// </summary>

        public static EntityConfiguration GetEntityConfiguration(this string typeShortAlias)
        {
            return ConfigurationStore.Get(typeShortAlias);
        }

        /// <summary>
        /// Get entity configuration by entity type
        /// </summary>
        public static EntityConfiguration GetEntityConfiguration(this Type entityType)
        {
            return ConfigurationStore.Get(entityType);
        }
    }
}
