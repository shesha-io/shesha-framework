using Shesha.ConfigurationItems;
using Shesha.Domain.Attributes;
using Shesha.Domain.ConfigurationItems;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    /// <summary>
    /// Configuration item base
    /// </summary>
    public class ConfigurationItemBase: ConfigurationItem, IConfigurationItem
    {
        public virtual Task<IList<ConfigurationItemBase>> GetDependenciesAsync()
        {
            return Task.FromResult<IList<ConfigurationItemBase>>(new List<ConfigurationItemBase>());
        }

        public virtual void Normalize() 
        {
            // If Origin is not specified - add self reference
            if (Origin == null)
                Origin = this;
        }
    }
}
