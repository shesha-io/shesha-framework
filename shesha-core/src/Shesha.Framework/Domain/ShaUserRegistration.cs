using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.Timing;
using Shesha.Domain.Attributes;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shesha.Domain
{
    [SnakeCaseNaming]
    [Table("user_registrations", Schema = "frwk")]
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class ShaUserRegistration : Entity<Guid>, IHasCreationTime
    {
        /// <summary>
        /// User's Id, if <see cref="UserNameOrEmailAddress"/> was a valid username or email address.
        /// </summary>
        public virtual long UserId { get; set; }

        /// <summary>
        /// User name or email address
        /// </summary>
        [MaxLength(255)]
        public virtual string UserNameOrEmailAddress { get; set; }

        /// <summary>
        /// Module name
        /// </summary>
        public virtual FormIdentifier? AdditionalRegistrationInfoForm { get; set; }

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
        public virtual string? GoToUrlAfterRegistration { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="ShaUserRegistration"/> class.
        /// </summary>
        public ShaUserRegistration()
        {
            CreationTime = Clock.Now;
        }
    }

}
