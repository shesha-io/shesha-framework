using Abp.Dependency;
using Shesha.ConfigurationItems.Distribution.Exceptions;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.ConfigurationItems.Distribution
{
    public static class DistributionHelper
    {
        /// <summary>
        /// Get all registered importers
        /// </summary>
        /// <param name="iocManager">IoC manager</param>
        /// <returns></returns>
        public static Dictionary<string, IConfigurableItemImport> GetRegisteredImportersDictionary(IIocManager iocManager) 
        {
            return iocManager.ResolveAll<IConfigurableItemImport>().ToImportersDictionary();
        }

        /// <summary>
        /// Convert list of importers to a dictionary where key = item type. Check for duplicates and throw <see cref="AmbiguousConfigurableItemException"/>
        /// </summary>
        /// <param name="importers"></param>
        /// <returns></returns>
        /// <exception cref="AmbiguousConfigurableItemException"></exception>
        public static Dictionary<string, IConfigurableItemImport> ToImportersDictionary(this IEnumerable<IConfigurableItemImport> importers) 
        {
            var importerGroups = importers
                .GroupBy(i => i.ItemType, (it, groupItems) => new { ItemType = it, Importers = groupItems })
                .ToList();
            var duplicates = importerGroups.Where(ig => ig.Importers.Count() > 1).ToDictionary(g => g.ItemType, g => g.Importers.Select(i => i.GetType()).ToList());
            if (duplicates.Any())
                throw new AmbiguousConfigurableItemException(duplicates);
            
            return importerGroups.ToDictionary(g => g.ItemType, g => g.Importers.First());
        }

        /// <summary>
        /// Get all registered exporters
        /// </summary>
        /// <param name="iocManager">IoC manager</param>
        /// <returns></returns>
        public static Dictionary<string, IConfigurableItemExport> GetRegisteredExportersDictionary(IIocManager iocManager)
        {
            return iocManager.ResolveAll<IConfigurableItemExport>().ToExportersDictionary();
        }

        /// <summary>
        /// Convert list of exporters to a dictionary where key = item type. Check for duplicates and throw <see cref="AmbiguousConfigurableItemException"/>
        /// </summary>
        /// <param name="exporters"></param>
        /// <returns></returns>
        /// <exception cref="AmbiguousConfigurableItemException"></exception>
        public static Dictionary<string, IConfigurableItemExport> ToExportersDictionary(this IEnumerable<IConfigurableItemExport> exporters)
        {
            var groups = exporters
                .GroupBy(i => i.ItemType, (it, groupItems) => new { ItemType = it, Exporters = groupItems })
                .ToList();
            var duplicates = groups.Where(ig => ig.Exporters.Count() > 1).ToDictionary(g => g.ItemType, g => g.Exporters.Select(i => i.GetType()).ToList());
            if (duplicates.Any())
                throw new AmbiguousConfigurableItemException(duplicates);

            return groups.ToDictionary(g => g.ItemType, g => g.Exporters.First());
        }
    }
}
