using System.Collections.Generic;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Modules hierarchy provider
    /// </summary>
    public interface IModuleHierarchyProvider
    {
        /// <summary>
        /// Get list of base modules specified explicitly (module hierarchy)
        /// </summary>
        IEnumerable<string> GetBaseModules(string moduleName);

        /// <summary>
        /// Get full hierarchy of modules including modules included by dependencies and orphaned ones
        /// </summary>
        /// <param name="moduleName"></param>
        /// <returns></returns>
        IEnumerable<string> GetFullHierarchy(string moduleName);
    }
}
