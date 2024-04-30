using Shesha.ConfigurationItems.Distribution;

namespace Shesha.Permissions.Distribution.Dto
{
    /// <summary>
    /// Distributed permission definition
    /// </summary>
    public class DistributedPermissionDefinition : DistributedConfigurableItemBase
    {
        public virtual string Parent { get; set; }
    }
}
