using System;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.ShaRoleAppointment")]
    [Discriminator]
    public class ShaRoleAppointment : FullAuditedEntity<Guid>, IMayHaveTenant
    {
        public virtual ShaRole Role { get; set; }
        public virtual int? TenantId { get; set; }
    }
}
