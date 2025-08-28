using Abp.Auditing;
using Abp.Domain.Entities;
using Abp.Localization;
using Abp.Timing;
using JetBrains.Annotations;
using Shesha.Authorization.Users;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.EntityHistory;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [Entity(TypeShortAlias = "Shesha.Core.Person")]
    [Table("Core_Persons") /* pluralize() returns wrong version */]
    [Discriminator]
    [DisplayManyToManyAuditTrail(typeof(ShaRoleAppointedPerson), "Role", DisplayName = "Role Appointment")]
    public class Person : FullPowerEntity
    {
        [StoredFile(IsVersionControlled = true)]
        public virtual StoredFile Photo { get; set; }

        [MaxLength(13)]
        [Display(Name = "Identity Number")]
        public virtual string? IdentityNumber { get; set; }

        public virtual RefListPersonTitle? Title { get; set; }

        [MaxLength(50)]
        [Display(Name = "First Name")]
        [Audited]
        public virtual string? FirstName { get; set; }

        [MaxLength(50)]
        [Display(Name = "Last Name")]
        [Audited]
        public virtual string? LastName { get; set; }

		[Display(Name = "Middle Name")]
		[MaxLength(50)]
		[Audited]
		public virtual string? MiddleName { get; set; }

		/// <summary>
		/// Initials override. If empty, the first letter of FirstName is taken.
		/// </summary>
		[MaxLength(10), Display(Name = "Initials")]
        public virtual string? Initials { get; set; }

        /// <summary>
        /// Custom short name (overrides calculated short name)
        /// </summary>
        [MaxLength(60)]
        [Display(Name = "Custom Short Name")]
        public virtual string? CustomShortName { get; set; }

        [MaxLength(20)]
        public virtual string? HomeNumber { get; set; }

        [MaxLength(20)]
        [Display(Name = "Mobile Number")]
        [Audited]
        public virtual string? MobileNumber1 { get; set; }

        [MaxLength(20)]
        [Display(Name = "Alternate Mobile Number")]
        public virtual string? MobileNumber2 { get; set; }

        [MaxLength(100), EmailAddress]
        [Display(Name = "Email Address")]
        [Audited]
        public virtual string? EmailAddress1 { get; set; }

        [MaxLength(100), EmailAddress]
        [Display(Name = "Alternative Email Address")]
        public virtual string? EmailAddress2 { get; set; }

        [Past]
        [Audited]
        [DisableDateTimeNormalization]
        [DataType(DataType.Date)]
        public virtual DateTime? DateOfBirth { get; set; }

        [Audited]
        public virtual RefListGender? Gender { get; set; }

        [ReferenceList("Shesha.Core", "PreferredContactMethod")]
        public virtual int? PreferredContactMethod { get; set; }

        /// <summary>
        /// Calcuated property in the following format: FirstName + ' ' + LastName
        /// </summary>
        [EntityDisplayName]
        [ReadonlyProperty]
        public virtual string? FullName { get; protected set; }

		/// <summary>
		/// 
		/// </summary>
		[Display(Name = "Address")]
		public virtual Address Address { get; set; }

		/// <summary>
		/// 
		/// </summary>
		[Display(Name = "Work Address")]
		public virtual Address WorkAddress { get; set; }

        /// <summary>
        /// User record, may be null for non registered users
        /// </summary>
        [CanBeNull]
        [CascadeUpdateRules(false, true)]
        public virtual User? User { get; set; }

        public override string? ToString()
        {
            return FullName;
        }

        [ManyToMany("Core_Persons_Languages", "LanguageId", "PersonId")]
        public virtual IList<ApplicationLanguage> PreferredLanguages { get; set; } = new List<ApplicationLanguage>();

        public virtual Organisation PrimaryOrganisation { get; set; }
        public virtual Account PrimaryAccount { get; set; }
        public virtual Site PrimarySite { get; set; }
        public virtual long? TargetingFlag { get; set; }

        [ReferenceList("Shesha.Core", "PersonType")]
        public virtual long? Type { get; set; }
    }
}
