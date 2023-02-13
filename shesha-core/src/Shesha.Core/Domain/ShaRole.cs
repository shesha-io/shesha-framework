using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Abp.Auditing;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.EntityHistory;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.ShaRole")]
    [DisplayManyToManyAuditTrail(typeof(ShaRoleAppointedPerson), "Person", DisplayName = "Member")]
    public class ShaRole: FullPowerEntity
    {
        public ShaRole()
        {
            Permissions = new List<ShaRolePermission>();
        }

        [StringLength(200)]
        public virtual string NameSpace { get; set; }

        [StringLength(500)]
        [Audited]
        public virtual string Name { get; set; }

        [StringLength(2000)]
        [Audited]
        public virtual string Description { get; set; }

        [Obsolete]
        public virtual int SortIndex { get; set; }

        public virtual IList<ShaRolePermission> Permissions { get; set; }

        // note: to be removed! todo: convert tu custom params
        [Obsolete]
        public virtual bool IsRegionSpecific { get; set; }

        [Obsolete]
        public virtual bool IsProcessConfigurationSpecific { get; set; }

        [Display(Name = "Hard linked to application", Description = "If true, indicates that the application logic references the value or name of this role and should therefore not be changed.")]
        public virtual bool HardLinkToApplication { get; protected set; }

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

        public virtual void SetHardLinkToApplication(bool value) 
        {
            HardLinkToApplication = value;
        }

        public override string ToString()
        {
            return Name;
        }
    }
}