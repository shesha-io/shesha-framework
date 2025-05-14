using Abp.Dependency;
using Castle.MicroKernel.Registration;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.ConfigurationItems;
using Shesha.Reflection;
using System;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Configurable Items IoC extensions
    /// </summary>
    public static class ConfigurationItemsIocManagerExtensions
    {
        /// <summary>
        /// Register items manager
        /// </summary>
        public static IIocManager RegisterConfigurableItemManager<TItem, TInterface, TImplementation>(this IIocManager iocManager)
            where TItem : ConfigurationItemBase
            where TInterface : IConfigurationItemManager
            where TImplementation : IConfigurationItemManager<TItem>
        {
            iocManager.IocContainer.Register(
                Component.For<IConfigurationItemManager<TItem>>().Forward<TInterface>().Forward<TImplementation>().ImplementedBy<TImplementation>().LifestyleTransient()
            );
            return iocManager;
        }

        /// <summary>
        /// Get manager for the specified type of the <see cref="ConfigurationItem"/>
        /// </summary>
        public static IConfigurationItemManager? GetItemManager(this IIocManager iocManager, Type itemType)
        {
            itemType = itemType.StripCastleProxyType();
            var managerType = typeof(ConfigurationItemBase).IsAssignableFrom(itemType)
                ? typeof(IConfigurationItemManager<>).MakeGenericType(itemType)
                : null;

            return managerType != null && iocManager.IsRegistered(managerType)
                ? iocManager.Resolve(managerType) as IConfigurationItemManager
                : itemType.BaseType != null
                    ? iocManager.GetItemManager(itemType.BaseType)
                    : null;
        }

        /// <summary>
        /// Get manager for the specified <paramref name="item"/>
        /// </summary>
        public static IConfigurationItemManager? GetItemManager(this IIocManager iocManager, ConfigurationItemBase item) 
        {
            return iocManager.GetItemManager(item.GetType());
        }
        

        /// <summary>
        /// Register items exporter
        /// </summary>
        public static IIocManager RegisterConfigurableItemExport<TItem, TInterface, TImplementation>(this IIocManager iocManager)
            where TItem : ConfigurationItemBase
            where TInterface : IConfigurableItemExport<TItem>
            where TImplementation : IConfigurableItemExport<TItem>
        {
            iocManager.IocContainer.Register(
                Component.For<IConfigurableItemExport>().Forward<IConfigurableItemExport<TItem>>().Forward<TInterface>().Forward<TImplementation>().ImplementedBy<TImplementation>().LifestyleTransient()
            );
            return iocManager;
        }

        /// <summary>
        /// Get exporter for specified type of the ConfigurationItem
        /// </summary>
        /// <param name="iocManager">IocManager instance</param>
        /// <param name="itemType">Type of the <see cref="ConfigurationItemBase"/></param>
        /// <returns></returns>
        public static IConfigurableItemExport? GetItemExporter(this IIocManager iocManager, Type itemType)
        {
            var exporterType = typeof(IConfigurableItemExport<>).MakeGenericType(itemType);

            return iocManager.IsRegistered(exporterType)
                ? iocManager.Resolve(exporterType) as IConfigurableItemExport
                : itemType.BaseType != null
                    ? iocManager.GetItemExporter(itemType.BaseType)
                    : null;
        }

        /// <summary>
        /// Register items importer
        /// </summary>
        public static IIocManager RegisterConfigurableItemImport<TItem, TInterface, TImplementation>(this IIocManager iocManager)
            where TItem : ConfigurationItemBase
            where TInterface : IConfigurableItemImport<TItem>
            where TImplementation : IConfigurableItemImport<TItem>
        {
            iocManager.IocContainer.Register(
                Component.For<IConfigurableItemImport>().Forward<IConfigurableItemImport<TItem>>().Forward<TInterface>().Forward<TImplementation>().ImplementedBy<TImplementation>().LifestyleTransient()
            );
            return iocManager;
        }

        public static IConfigurableItemImport? GetItemImporter(this IIocManager iocManager, Type itemType)
        {
            var importerType = typeof(IConfigurableItemImport<>).MakeGenericType(itemType);

            return iocManager.IsRegistered(importerType)
                ? iocManager.Resolve(importerType) as IConfigurableItemImport
                : itemType.BaseType != null
                    ? iocManager.GetItemImporter(itemType.BaseType)
                    : null;
        }
    }
}
