using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.SecurityQuestion")]
    public class SecurityQuestion: FullAuditedEntity<Guid>
    {
        /// <summary>
        /// 
        /// </summary>
        [StringLength(2000)]
        public virtual string Question { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public virtual int? TenantId { get; set; }
    }
}
