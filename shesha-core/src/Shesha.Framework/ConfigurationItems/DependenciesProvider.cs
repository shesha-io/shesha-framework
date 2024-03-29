﻿using Shesha.Domain;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems
{
    /// <summary>
    /// Base class of the Dependencies Provider. Allows to get a list of dependencies of <see cref="IConfigurationItem"/>
    /// </summary>
    public abstract class DependenciesProvider<TItem> : IDependenciesProvider<TItem> where TItem : IConfigurationItem
    {
        public async Task<IList<ConfigurationItemIdentifier>> GetReferencedItemsAsync(ConfigurationItemBase item)
        {
            return item is TItem typedItem
                ? await GetReferencedItemsTypedAsync(typedItem)
                : new List<ConfigurationItemIdentifier>();
        }

        public abstract Task<IList<ConfigurationItemIdentifier>> GetReferencedItemsTypedAsync(TItem item);
    }
}
