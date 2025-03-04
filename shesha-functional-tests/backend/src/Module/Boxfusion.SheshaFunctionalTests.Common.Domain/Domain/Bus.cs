using Abp.Auditing;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.EntityHistory;
using System.Collections.Generic;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    public class Bus : Organisation
    { 
        [Audited]
        [ManyToMany(true)]
        public virtual IList<Person> People { get; set; } = new List<Person>();
        /// <summary>
        /// 
        /// </summary>
        [AuditedAsManyToMany]
        [ManyToMany(true)]
        public virtual IList<Person> Workers { get; set; } = new List<Person>();

    }
}
