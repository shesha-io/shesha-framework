using System;
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

        public GenericEntityReference PermissionedEntity1 { get; set; }
        public GenericEntityReference PermissionedEntity2 { get; set; }
        public GenericEntityReference PermissionedEntity3 { get; set; }

        public virtual DateTime? FromDate { get; set; }
        public virtual DateTime? ToDate   { get; set; }

        [ReferenceList("Shesha.Core", "RoleAppointmentStatus")]
        public virtual int? Status { get; set; }
        
            
    }
}
