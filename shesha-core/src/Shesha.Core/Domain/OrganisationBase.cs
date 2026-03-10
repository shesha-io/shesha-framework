using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Auditing;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Shesha.Domain.Attributes;
using Shesha.DynamicEntities;

namespace Shesha.Domain
{
    [Table("Core_Organisations")]
    [Discriminator]
    public class OrganisationBase : FullAuditedEntityWithExternalSync<Guid>, IMayHaveTenant
    {
        [EntityDisplayName]
        [StringLength(255, MinimumLength = 2)]
        [Required(AllowEmptyStrings = false)]
        public virtual string Name { get; set; }
        /// <summary>
        /// 
        /// </summary>

        [MaxLength(50)]
        [Browsable(false)]
        public virtual string ShortAlias { get; set; }
        /// <summary>
        /// 
        /// </summary>

        [MaxLength(300), DataType(DataType.MultilineText)]
        public virtual string Description { get; set; }
        /// <summary>
        /// 
        /// </summary>

        [MaxLength(1000), DataType(DataType.MultilineText)]
        [Display(Name = "Address (free text)")]
        public virtual string FreeTextAddress { get; set; }
        /// <summary>
        /// 
        /// </summary>

        [ReferenceList("Shesha.Core", "OrganisationUnitType")]
        public virtual int? OrganisationType { get; set; }
        /// <summary>
        /// 
        /// </summary>

        public virtual int? TenantId { get; set; }
        /// <summary>
        /// 
        /// </summary>

        [MaxLength(200)]
        public virtual string ContactEmail { get; set; }
        /// <summary>
        /// 
        /// </summary>
        [MaxLength(50)]
        public virtual string ContactMobileNo { get; set; }
        /// <summary>
        /// 
        /// </summary>
        [MaxLength(200)]
        public virtual string ContactName { get; set; }
        /// <summary>
        /// 
        /// </summary>
        [MaxLength(200)]
        public virtual string ContactRole { get; set; }
        /// <summary>
        /// 
        /// </summary>

        [ReferenceList("Shesha.Core", "OrganisationStatus")]
        public virtual long? Status { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual int? OrderIndex { get; set; }
    }


    public abstract class OrganisationBase<T, TAddress, TPerson> : OrganisationBase where T : OrganisationBase<T, TAddress, TPerson> where TPerson : Person
    {
        /// <summary>
        /// Parent organisation
        /// </summary>
        public virtual T Parent { get; set; }

        /// <summary>
        /// Primary Address
        /// </summary>
        [Audited]
        public virtual TAddress PrimaryAddress { get; set; }

        /// <summary>
        /// Primary contact
        /// </summary>
        [Audited]
        [CascadeUpdateRules(true, true)]
        public virtual TPerson PrimaryContact { get; set; }

        /// <summary>
        /// Child organisations
        /// </summary>
        [InverseProperty("ParentId")]
        public virtual IList<T> Units { get; set; }
    }

    public class OrganisationBase<T> : OrganisationBase<T, Address, Person>
        where T : OrganisationBase<T>
    {
    }
}
