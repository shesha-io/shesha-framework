using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    /// <summary>
    /// 
    /// </summary>

    [Discriminator]
    public class Book : FullAuditedEntity<Guid>
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
        public virtual decimal? Price { get; set; }

        /// <summary> 
        /// 
        /// </summary>
        public virtual TimeSpan? Time { get; set; }

    }
}