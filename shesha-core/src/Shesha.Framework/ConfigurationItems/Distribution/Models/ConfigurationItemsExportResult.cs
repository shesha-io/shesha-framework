using System.Collections.Generic;

namespace Shesha.ConfigurationItems.Distribution.Models
{
    /// <summary>
    /// Configuration items export result
    /// </summary>
    public class ConfigurationItemsExportResult
    {
        /// <summary>
        /// Exported items
        /// </summary>
        public List<ConfigurationItemsExportItem> Items { get; set; } = new();
    }

    public class ConfigurationItemsExportItem 
    { 
        /// <summary>
        /// Item data
        /// </summary>
        public required DistributedConfigurableItemBase ItemData { get; init; }

        /// <summary>
        /// Relative path in the zip
        /// </summary>
        public required string RelativePath { get; init; }

        /// <summary>
        /// Corresponding exporter
        /// </summary>
        public required IConfigurableItemExport Exporter { get; init; }
    }
}
