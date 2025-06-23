using Shesha.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Dependencies provider. Allows to get a list of dependencies of <see cref="IConfigurationItem"/>
    /// </summary>
    public interface IDependenciesProvider<TItem>: IDependenciesProvider where TItem: IConfigurationItem
    {
        /// <summary>
        /// Get list of referenced configuration items
        /// </summary>
        /// <returns></returns>
        Task<IList<ConfigurationItemIdentifier>> GetReferencedItemsTypedAsync(TItem item);
    }

    /// <summary>
    /// Dependencies provider. Allows to get a list of dependencies of <see cref="IConfigurationItem"/>
    /// </summary>
    public interface IDependenciesProvider 
    {
        /// <summary>
        /// Get list of referenced configuration items
        /// </summary>
        /// <returns></returns>
        Task<IList<ConfigurationItemIdentifier>> GetReferencedItemsAsync(ConfigurationItem item);
    }
}
