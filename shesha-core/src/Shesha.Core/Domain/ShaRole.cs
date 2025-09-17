using Abp.Domain.Entities;
using Shesha.Domain.Attributes;
using Shesha.Domain.Constants;
using Shesha.EntityHistory;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Role
    /// </summary>
    [Entity(FriendlyName = "Role", TypeShortAlias = "Shesha.Core.ShaRole")]
    [FixedView(ConfigurationItemsViews.Create, SheshaFrameworkModule.ModuleName, "cs-role-create")]
    [FixedView(ConfigurationItemsViews.Rename, SheshaFrameworkModule.ModuleName, "cs-item-rename")]
    [DisplayManyToManyAuditTrail(typeof(ShaRoleAppointedPerson), "Person", DisplayName = "Member")]
    [JoinedProperty("roles", Schema = "frwk")]
    [Prefix(UsePrefixes = false)]
    [DiscriminatorValue(ItemTypeName)]
    [SnakeCaseNaming]
    public class ShaRole : ConfigurationItem
    {
        public const string ItemTypeName = "role";

        public override string ToString()
        {
            return Name;
        }

        [MaxLength(200)]
        public virtual string NameSpace { get; set; }

        [InverseProperty("role_id")]
        public virtual IList<ShaRolePermission> Permissions { get; set; } = new List<ShaRolePermission>();

        [Display(Name = "Hard linked to application", Description = "If true, indicates that the application logic references the value or name of this role and should therefore not be changed.")]
        public virtual bool HardLinkToApplication { get; protected set; }

        public virtual void SetHardLinkToApplication(bool value)
        {
            HardLinkToApplication = value;
        }

    }
}