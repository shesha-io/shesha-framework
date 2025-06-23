using Shesha.Domain.Attributes;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.ShaRolePermission")]
    [Table("role_permissions", Schema = "frwk")]
    [SnakeCaseNaming]
    public class ShaRolePermission : FullPowerEntity
    {
        /// <summary>
        /// Role revision
        /// </summary>
        public required virtual ShaRoleRevision RoleRevision { get; set; }

        /// <summary>
        /// Permission
        /// </summary>
        public required virtual string Permission { get; set; }
        
        /// <summary>
        /// If true, indicates that permission is granted
        /// </summary>
        public virtual bool IsGranted { get; set; }
    }
}