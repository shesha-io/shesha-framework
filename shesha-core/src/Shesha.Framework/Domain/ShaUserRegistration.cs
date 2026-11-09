using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.Timing;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [Table("Frwk_UserRegistration")]
    [Entity(CrudActions = CrudActions.None, IsConfigurable = false)]
    public class ShaUserRegistration : Entity<Guid>, IHasCreationTime
    {
        /// <summary>
        /// User's Id, if <see cref="UserNameOrEmailAddress"/> was a valid username or email address.
        /// </summary>
        public virtual long UserId { get; set; }

        /// <summary>
        /// User name or email address
        /// </summary>
        public virtual string UserNameOrEmailAddress { get; set; }

        /// <summary>
        /// Module name
        /// </summary>
        public virtual FormIdentifier AdditionalRegistrationInfoForm { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public virtual DateTime CreationTime { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public virtual bool IsComplete { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public virtual string GoToUrlAfterRegistration { get; set; }

        /// <summary>
        /// SHA-256 hash (hex) of the single-use token that lets the registrant complete the additional registration
        /// information step before they are able to log in. The token itself is never stored.
        /// </summary>
        [StringLength(64)]
        public virtual string CompletionTokenHash { get; set; }

        /// <summary>
        /// Expiry of the token in <see cref="CompletionTokenHash"/>
        /// </summary>
        public virtual DateTime? CompletionTokenExpiresOn { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="ShaUserRegistration"/> class.
        /// </summary>
        public ShaUserRegistration()
        {
            CreationTime = Clock.Now;
        }
    }

}
