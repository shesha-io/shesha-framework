using Shesha.Domain;
using System.Threading;

namespace Shesha.ConfigurationItems.Distribution
{
    /// <summary>
    /// Configuration items import context
    /// </summary>
    public interface IConfigurationItemsImportContext
    {
        /// <summary>
        /// If true, indicates that modules should be created automatically if missing
        /// </summary>
        public bool CreateModules { get; }

        /// <summary>
        /// If true, indicates that front-end applications should be created automatically if missing
        /// </summary>
        public bool CreateFrontEndApplications { get; }

        /// <summary>
        /// Import result. If specified, all imported items will be linked to the corresponding import session
        /// </summary>
        public ConfigurationPackageImportResult? ImportResult { get; }

        /// <summary>
        /// Cancellation token. Is used for termination of the import process 
        /// </summary>
        public CancellationToken CancellationToken { get; }

        /// <summary>
        /// If true, indicates that current import is a migration
        /// </summary>
        public bool IsMigrationImport { get; }
    }
}
