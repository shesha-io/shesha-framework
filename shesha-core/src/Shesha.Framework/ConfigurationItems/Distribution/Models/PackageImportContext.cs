using Castle.Core.Logging;
using Shesha.Domain;
using System;
using System.Threading;

namespace Shesha.ConfigurationItems.Distribution
{
    /// <summary>
    /// Configuration items import context
    /// </summary>
    public class PackageImportContext: IConfigurationItemsImportContext
    {
        /// <summary>
        /// If true, indicates that modules should be created automatically if missing
        /// </summary>
        public bool CreateModules { get; set; }

        /// <summary>
        /// If true, indicates that front-end applications should be created automatically if missing
        /// </summary>
        public bool CreateFrontEndApplications { get; set; }

        /// <summary>
        /// Is used to override status of the imported items. Live empty to import statuses as is.
        /// </summary>
        public ConfigurationItemVersionStatus? ImportStatusAs { get; set; }

        /// <summary>
        /// Import result. If specified, all imported items will be linked to the corresponding import session
        /// </summary>
        public ConfigurationPackageImportResult? ImportResult { get; set; }

        /// <summary>
        /// Cancellation token. Is used for termination of the import process 
        /// </summary>
        public CancellationToken CancellationToken { get; set; } = default!;

        /// <summary>
        /// Filter of items. Return true to import and false to skip import of the specified item
        /// </summary>
        public Func<DistributedConfigurableItemBase, bool>? ShouldImportItem { get; set; }

        /// <summary>
        /// Logger
        /// </summary>
        public ILogger Logger { get; set; } = NullLogger.Instance;
    }
}
