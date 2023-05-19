using System;
using System.ComponentModel.DataAnnotations;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain;
using Shesha.Domain.Attributes;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    /// <summary>
    /// 
    /// </summary>

    [Discriminator]
    public class School : FullAuditedEntity<Guid>
    {
        /// <summary> 
        /// 
        /// </summary>
        public virtual string Name { get; set; }

        /// <summary> 
        /// 
        /// </summary>
        public virtual decimal? Latitude { get; set; }

        /// <summary> 
        /// 
        /// </summary>
        public virtual decimal? Longitude { get; set; }

        /// <summary> 
        /// 
        /// </summary>
        public virtual string ContactNumber { get; set; }

        /// <summary> 
        /// 
        /// </summary>
        public virtual Address Address { get; set; }

        /// <summary> 
        /// 
        /// </summary>
        public virtual Person HeadLeader { get; set; }
    }
}