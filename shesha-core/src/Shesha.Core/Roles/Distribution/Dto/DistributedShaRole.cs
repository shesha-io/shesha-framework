using Shesha.ConfigurationItems.Distribution;
using System.Collections.Generic;

namespace Shesha.Roles.Distribution.Dto
{
    /// <summary>
    /// Distributed ShaRole
    /// </summary>
    public class DistributedShaRole : DistributedConfigurableItemBase
    {
        public virtual string NameSpace { get; set; }

        public virtual IList<DistributedShaRolePermission> Permissions { get; set; }

        public virtual bool HardLinkToApplication { get; set; }
    }
}
