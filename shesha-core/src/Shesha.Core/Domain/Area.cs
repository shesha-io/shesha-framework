using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.Area")]
    [Discriminator]
    public class Area : FullAuditedEntity<Guid>, IMayHaveTenant
    {
        [Required(AllowEmptyStrings = false), StringLength(100)]
        public virtual string Name { get; set; }

        [Required(AllowEmptyStrings = false), StringLength(10)]
        public virtual string ShortName { get; set; }

        [StringLength(200)]
        public virtual string Comments { get; set; }

        public virtual Area ParentArea { get; set; }
        
        public virtual int? TenantId { get; set; }

        public virtual RefListAreaType? AreaType { get; set; }
    }
}
