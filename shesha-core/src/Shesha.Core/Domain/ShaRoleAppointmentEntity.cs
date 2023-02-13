using System;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.ShaRoleAppointmentEntity")]
    public class ShaRoleAppointmentEntity : FullAuditedEntity<Guid>, IMayHaveTenant
    {
        public virtual ShaRoleAppointment Appointment { get; set; }
        public virtual string EntityTypeAlias { get; set; }
        public virtual string EntityId { get; set; }
        public virtual int? TenantId { get; set; }
    }
}