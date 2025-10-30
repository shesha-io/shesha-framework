using Abp.Dependency;
using Castle.MicroKernel.Registration;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
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
            where TItem : ConfigurationItem
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
        public static IConfigurationItemManager? GetItemManager(this IIocResolver iocResolver, Type itemType)
        {
            itemType = itemType.StripCastleProxyType();
            var managerType = typeof(ConfigurationItem).IsAssignableFrom(itemType)
                ? typeof(IConfigurationItemManager<>).MakeGenericType(itemType)
                : null;

            return managerType != null && iocResolver.IsRegistered(managerType)
                ? iocResolver.Resolve(managerType) as IConfigurationItemManager
                : itemType.BaseType != null
                    ? iocResolver.GetItemManager(itemType.BaseType)
                    : null;
        }

        /// <summary>
        /// Get manager for the specified <paramref name="item"/>
        /// </summary>
        public static IConfigurationItemManager? GetItemManager(this IIocResolver iocResolver, ConfigurationItem item) 
        {
            return iocResolver.GetItemManager(item.GetType());
        }
        

        /// <summary>
        /// Register items exporter
        /// </summary>
        public static IIocManager RegisterConfigurableItemExport<TItem, TInterface, TImplementation>(this IIocManager iocManager)
            where TItem : ConfigurationItem
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
        /// <param name="iocResolver">IocManager instance</param>
        /// <param name="itemType">Type of the <see cref="ConfigurationItem"/></param>
        /// <returns></returns>
        public static IConfigurableItemExport? GetItemExporter(this IIocResolver iocResolver, Type itemType)
        {
            var exporterType = typeof(IConfigurableItemExport<>).MakeGenericType(itemType);

            return iocResolver.IsRegistered(exporterType)
                ? iocResolver.Resolve(exporterType) as IConfigurableItemExport
                : itemType.BaseType != null
                    ? iocResolver.GetItemExporter(itemType.BaseType)
                    : null;
        }

        /// <summary>
        /// Register items importer
        /// </summary>
        public static IIocManager RegisterConfigurableItemImport<TItem, TInterface, TImplementation>(this IIocManager iocResolver)
            where TItem : ConfigurationItem
            where TInterface : IConfigurableItemImport<TItem>
            where TImplementation : IConfigurableItemImport<TItem>
        {
            iocResolver.IocContainer.Register(
                Component.For<IConfigurableItemImport>().Forward<IConfigurableItemImport<TItem>>().Forward<TInterface>().Forward<TImplementation>().ImplementedBy<TImplementation>().LifestyleTransient()
            );
            return iocResolver;
        }

        public static IConfigurableItemImport? GetItemImporter(this IIocResolver iocResolver, Type itemType)
        {
            var importerType = typeof(IConfigurableItemImport<>).MakeGenericType(itemType);

            return iocResolver.IsRegistered(importerType)
                ? iocResolver.Resolve(importerType) as IConfigurableItemImport
                : itemType.BaseType != null
                    ? iocResolver.GetItemImporter(itemType.BaseType)
                    : null;
        }
    }
}
