using Abp.Dependency;
using Shesha.ConfigurationItems.Models;
using Shesha.Domain;
using Shesha.Services;
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
        public IList<ConfigurationItemBase> Items { get; set; }

        /// <summary>
        /// Enable/disable export of dependencies
        /// </summary>
        public bool ExportDependencies { get; set; }

        /// <summary>
        /// Mode of the version selection (live/ready/latest)
        /// </summary>
        public ConfigurationItemViewMode VersionSelectionMode { get; set; }

        /// <summary>
        /// Exporters
        /// </summary>
        public Dictionary<string, IConfigurableItemExport> Exporters { get; private set; }

        public PreparePackageContext(IList<ConfigurationItemBase> items, Dictionary<string, IConfigurableItemExport> exporters)
        {
            Exporters = exporters;
            Items = items;
        }
        public PreparePackageContext(IList<ConfigurationItemBase> items, IIocManager iocManager)
        {
            Exporters = DistributionHelper.GetRegisteredExportersDictionary(iocManager);
            Items = items;
        }
        public PreparePackageContext(IList<ConfigurationItemBase> items) : this(items, StaticContext.IocManager) 
        { 
        }
    }
}