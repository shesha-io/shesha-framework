using Abp.Auditing;
using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System;

namespace Shesha.Roles.Distribution.Dto
{
    /// <summary>
    /// Distributed ShaRole
    /// </summary>
    public class DistributedShaRole : DistributedConfigurableItemBase
    {
        public virtual string NameSpace { get; set; }

        [Obsolete]
        public virtual int SortIndex { get; set; }

        public virtual IList<DistributedShaRolePermission> Permissions { get; set; }

        // note: to be removed! todo: convert tu custom params
        [Obsolete]
        public virtual bool IsRegionSpecific { get; set; }

        [Obsolete]
        public virtual bool IsProcessConfigurationSpecific { get; set; }

        public virtual bool HardLinkToApplication { get; set; }

        [Obsolete]
        public virtual bool CanAssignToMultiple { get; set; }
        [Obsolete]
        public virtual bool CanAssignToPerson { get; set; }
        [Obsolete]
        public virtual bool CanAssignToRole { get; set; }
        [Obsolete]
        public virtual bool CanAssignToOrganisationRoleLevel { get; set; }
        [Obsolete]
        public virtual bool CanAssignToUnit { get; set; }

    }
}
