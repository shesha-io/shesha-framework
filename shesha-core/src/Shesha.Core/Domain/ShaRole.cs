using Abp.Auditing;
using Abp.Domain.Entities;
using Shesha.Authorization;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.EntityHistory;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    [Entity(FriendlyName = "Role",
        TypeShortAlias = "Shesha.Core.ShaRole",
        IsConfigurable = false,
        CrudActions = CrudActions.All,
        CrudActionsAccess = CrudActionsAccess.RequiresPermissions,
        CrudActionsPermissions = [PermissionNames.Role_Manage]
    )]
    [EntityAuthorize(CrudAction.Read, [PermissionNames.Role_Manage, PermissionNames.User_Manage])]
    [DisplayManyToManyAuditTrail(typeof(ShaRoleAppointedPerson), "Person", DisplayName = "Member")]
    [JoinedProperty("Core_ShaRoles")]
    [Prefix(UsePrefixes = false)]
    [DiscriminatorValue(ItemTypeName)]
    public class ShaRole : ConfigurationItemBase
    {
        public const string ItemTypeName = "role";

        public ShaRole()
        {
            Permissions = new List<ShaRolePermission>();
        }

        [StringLength(200)]
        public virtual string NameSpace { get; set; }

        [StringLength(500)]
        [Audited]
        public override string Name { get; set; }

        [StringLength(2000)]
        [Audited]
        public override string Description { get; set; }

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