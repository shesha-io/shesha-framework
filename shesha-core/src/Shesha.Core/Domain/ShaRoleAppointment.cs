using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.EntityReferences;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.ShaRoleAppointment")]
    [Discriminator]
    public class ShaRoleAppointment : FullAuditedEntity<Guid>, IMayHaveTenant
    {
        public virtual ShaRole Role { get; set; }
        public virtual int? TenantId { get; set; }

        [EntityReference(true)]
        public GenericEntityReference PermissionedEntity1 { get; set; }
        [EntityReference(true)]
        public GenericEntityReference PermissionedEntity2 { get; set; }
        [EntityReference(true)]
        public GenericEntityReference PermissionedEntity3 { get; set; }

        [NotMapped]
        public IEnumerable<GenericEntityReference> PermissionedEntities
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
