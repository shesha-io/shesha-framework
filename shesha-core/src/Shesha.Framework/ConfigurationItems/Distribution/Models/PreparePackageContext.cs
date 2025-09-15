using Abp.Dependency;
using Shesha.Domain;
using Shesha.Reflection;
using Shesha.Services;
using System;
using System.Collections.Generic;

namespace Shesha.ConfigurationItems.Distribution.Models
{
    /// <summary>
    /// Configuration items export arguments
    /// </summary>
    public class PreparePackageContext
    {
        /// <summary>
        /// List of items to be exported
        /// </summary>
        public IList<ConfigurationItem> Items { get; set; }

        /// <summary>
        /// Enable/disable export of dependencies
        /// </summary>
        public bool ExportDependencies { get; set; }

        private readonly IIocManager _iocManager;
        
        private readonly Dictionary<Type, IConfigurableItemExport?> _exporters = new Dictionary<Type, IConfigurableItemExport?>();

        public IConfigurableItemExport? GetExporter(ConfigurationItem item) 
        {
            var itemType = item.GetType().StripCastleProxyType();

            if (_exporters.TryGetValue(itemType, out var exporter))
                return exporter;

            exporter = _iocManager.GetItemExporter(itemType);
            _exporters[itemType] = exporter;

            return exporter;            
        }

        public PreparePackageContext(IList<ConfigurationItem> items, IIocManager iocManager)
        {
            _iocManager = iocManager;
            Items = items;
        }
        public PreparePackageContext(IList<ConfigurationItem> items) : this(items, StaticContext.IocManager) 
        { 
        }
    }
}