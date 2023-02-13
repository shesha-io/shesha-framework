using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Auditing;
using Abp.Localization;
using Abp.Timing;
using JetBrains.Annotations;
using Shesha.Authorization.Users;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.EntityHistory;
using Shesha.Extensions;

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

        [StringLength(13)]
        [Display(Name = "Identity Number")]
        public virtual string IdentityNumber { get; set; }

        public virtual RefListPersonTitle? Title { get; set; }

        [StringLength(50)]
        [Display(Name = "First Name")]
        [Audited]
        public virtual string FirstName { get; set; }

        [StringLength(50)]
        [Display(Name = "Last Name")]
        [Audited]
        public virtual string LastName { get; set; }

		[Display(Name = "Middle Name")]
		[StringLength(50)]
		[Audited]
		public virtual string MiddleName { get; set; }

		/// <summary>
		/// Initials override. If empty, the first letter of FirstName is taken.
		/// </summary>
		[StringLength(10), Display(Name = "Initials")]
        public virtual string Initials { get; set; }

        /// <summary>
        /// Custom short name (overrides calculated short name)
        /// </summary>
        [StringLength(60)]
        [Display(Name = "Custom Short Name")]
        public virtual string CustomShortName { get; set; }

        [StringLength(20)]
        public virtual string HomeNumber { get; set; }

        [StringLength(20)]
        [Display(Name = "Mobile Number")]
        [Audited]
        public virtual string MobileNumber1 { get; set; }

        [StringLength(20)]
        [Display(Name = "Alternate Mobile Number")]
        public virtual string MobileNumber2 { get; set; }

        [StringLength(100), EmailAddress]
        [Display(Name = "Email Address")]
        [Audited]
        public virtual string EmailAddress1 { get; set; }

        [StringLength(100), EmailAddress]
        [Display(Name = "Alternative Email Address")]
        public virtual string EmailAddress2 { get; set; }

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
        public virtual string FullName { get; protected set; }

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
        public virtual User User { get; set; }

        public override string ToString()
        {
            return FullName;
        }

        [ManyToMany("Core_Persons_Languages", "LanguageId", "PersonId")]
        public virtual IList<ApplicationLanguage> PreferredLanguages { get; set; } = new List<ApplicationLanguage>();
    }
}
