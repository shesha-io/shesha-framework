using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.SecurityQuestion")]
    public class SecurityQuestion: FullAuditedEntity<Guid>
    {
        /// <summary>
        /// 
        /// </summary>
        [MaxLength(2000)]
        public virtual string Question { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public virtual int? TenantId { get; set; }
    }
}
