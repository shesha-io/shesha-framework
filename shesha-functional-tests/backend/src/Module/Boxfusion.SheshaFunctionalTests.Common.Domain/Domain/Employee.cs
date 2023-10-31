using Abp.Domain.Entities;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using System;

namespace Boxfusion.SheshaFunctionalTests.Common.Domain.Domain
{
    [Entity(TypeShortAlias = "Boxfusion.SheshaFunctionalTests.Domain.Employee")]
    public class Employee : Entity<Guid>
    {
        /// <summary>
        /// Order Index property for sorting
        /// </summary>
        public virtual int OrderIndex { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual Organisation Company { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual string FirstName { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual string LastName { get; set; }
        /// <summary> 
        /// 
        /// </summary>
        public virtual StoredFile OtherDocuments { get; set; }
        /// <summary> 
        /// 
        /// </summary>
        public virtual StoredFile PaySlip { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual Note Note { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual string RichTextEditor { get; set; }
    }
}
