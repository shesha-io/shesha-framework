using Shesha.Domain.Attributes;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    /// <summary>
    /// Role Revision
    /// </summary>
    [JoinedProperty("role_revisions", Schema = "frwk")]
    [SnakeCaseNaming]
    [Prefix(UsePrefixes = false)]
    [DiscriminatorValue(ShaRole.ItemTypeName)]
    public class ShaRoleRevision : ConfigurationItemRevision
    {
        [MaxLength(200)]
        public virtual string NameSpace { get; set; }

        [InverseProperty("role_revision_id")]
        public virtual IList<ShaRolePermission> Permissions { get; set; }

        [Display(Name = "Hard linked to application", Description = "If true, indicates that the application logic references the value or name of this role and should therefore not be changed.")]
        public virtual bool HardLinkToApplication { get; protected set; }

        public virtual void SetHardLinkToApplication(bool value)
        {
            HardLinkToApplication = value;
        }
        public ShaRoleRevision()
        {
            Permissions = new List<ShaRolePermission>();
        }
    }
}
