using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.EntityReferences;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.ShaRoleAppointment")]
    [Discriminator]
    [Table("role_appointments", Schema = "frwk")]
    [SnakeCaseNaming]
    public class ShaRoleAppointment : FullAuditedEntity<Guid>
    {
        /// <summary>
        /// Role
        /// </summary>
        public virtual ShaRole Role { get; set; }

        [EntityReference(true)]
        public virtual GenericEntityReference? PermissionedEntity1 { get; set; }
        [EntityReference(true)]
        public virtual GenericEntityReference? PermissionedEntity2 { get; set; }
        [EntityReference(true)]
        public virtual GenericEntityReference? PermissionedEntity3 { get; set; }

        [NotMapped]
        public virtual IEnumerable<GenericEntityReference> PermissionedEntities
        {
            get
            {
                if (PermissionedEntity1 != null) yield return PermissionedEntity1;
                if (PermissionedEntity2 != null) yield return PermissionedEntity2;
                if (PermissionedEntity3 != null) yield return PermissionedEntity3;
            }
        }

        public virtual DateTime? FromDate { get; set; }
        public virtual DateTime? ToDate { get; set; }

        [ReferenceList("Shesha.Core", "RoleAppointmentStatus")]
        public virtual int? Status { get; set; }

    }
}
