using Abp.Auditing;
using Abp.Domain.Entities;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.EntityHistory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
