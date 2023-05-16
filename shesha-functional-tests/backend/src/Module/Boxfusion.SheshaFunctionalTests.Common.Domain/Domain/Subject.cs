using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities.Auditing;
using Intent.RoslynWeaver.Attributes;
using Shesha.Domain.Attributes;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    /// <summary>
    /// 
    /// </summary>

    [Discriminator]
    public class Subject : FullAuditedEntity<Guid>
    {
        /// <summary> 
        /// 
        /// </summary>
        public virtual string Name { get; set; }

        /// <summary> 
        /// 
        /// </summary>
        public virtual string Description { get; set; }

        /// <summary> 
        /// 
        /// </summary>
        public virtual decimal? Total { get; set; }

        /// <summary> 
        /// 
        /// </summary>
        public virtual Book Book { get; set; }

        /// <summary> 
        /// 
        /// </summary>
        public virtual School School { get; set; }
    }
}