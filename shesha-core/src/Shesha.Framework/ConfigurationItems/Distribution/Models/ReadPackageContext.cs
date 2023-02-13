using Abp.Dependency;
using Shesha.Services;
using System.Collections.Generic;

namespace Shesha.ConfigurationItems.Distribution.Models
{
    /// <summary>
    /// Read package context
    /// </summary>
    public class ReadPackageContext
    {
        /// <summary>
        /// Importers
        /// </summary>
        public Dictionary<string, IConfigurableItemImport> Importers { get; private set; }

        /// <summary>
        /// If true, indicates that unsupported items (the ones which have no corresponding importer) should be skipped, otherwise an exception should be thrown.
        /// </summary>
        public bool SkipUnsupportedItems { get; set; }

        public ReadPackageContext(Dictionary<string, IConfigurableItemImport> importers)
        {
            Importers = importers;
        }
        public ReadPackageContext(IIocManager iocManager)
        {
            Importers = DistributionHelper.GetRegisteredImportersDictionary(iocManager);
        }
        public ReadPackageContext() : this(StaticContext.IocManager)
        {
        }
    }
}
