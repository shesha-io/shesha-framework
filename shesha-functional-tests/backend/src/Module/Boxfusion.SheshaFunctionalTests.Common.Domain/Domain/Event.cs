using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    [Entity(TypeShortAlias = "SheshaFunctionalTests.Event")]

    public class Event: FullAuditedEntity<Guid>
    {

        public virtual string Title { get; set; }
        /// <summary> 
        /// 
        /// </summary>
        [StringLength(int.MaxValue)]
        public virtual string Description { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual DateTime? StartDate { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual DateTime? EndDate { get; set; }
    }
}
