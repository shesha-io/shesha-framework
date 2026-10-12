using Shesha.ConfigurationItems;
using Shesha.Domain.Attributes;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    /// <summary>
    /// Configuration item base
    /// </summary>
    [Entity(CrudActions = CrudActions.None, IsConfigurable = false)]
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
