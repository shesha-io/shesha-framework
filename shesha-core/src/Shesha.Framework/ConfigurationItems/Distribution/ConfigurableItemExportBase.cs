using Shesha.Domain;
using System.Threading.Tasks;

namespace Shesha.ConfigurationItems.Distribution
{
    /// <summary>
    /// Base exporter of configurable items
    /// </summary>
    public abstract class ConfigurableItemExportBase
    {
        /// <summary>
        /// Check is item can be exported
        /// </summary>
        /// <param name="item"></param>
        /// <returns></returns>
        public virtual Task<bool> CanExportItemAsync(ConfigurationItem item) 
        {
            var canEdport = item is IDistributedConfigurationItem ci && ci.HasRevision;
            return Task.FromResult(canEdport);
        }
    }
}
