using Shesha.ConfigurationItems;
using Shesha.Domain.ConfigurationItems;

namespace Shesha.Domain
{
    /// <summary>
    /// Configuration item base
    /// </summary>
    public class ConfigurationItemBase: ConfigurationItem, IConfigurationItem
    {
        public virtual void Normalize() 
        {
            // If Origin is not specified - add self reference
            if (Origin == null)
                Origin = this;
        }
    }
}
