using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Authorization.Users;
using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Abp.MultiTenancy;
using Abp.Timing;
using Shesha.Authorization;
using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    [SnakeCaseNaming]
    [Table("user_login_attempts", Schema = "frwk")]
    [Entity(GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
    public class ShaUserLoginAttempt : Entity<Guid>, IHasCreationTime, IMayHaveTenant
    {
        /// <summary>
        /// Max length of the <see cref="TenancyName"/> property.
        /// </summary>
        public const int MaxTenancyNameLength = AbpTenantBase.MaxTenancyNameLength;

        /// <summary>
        /// Max length of the <see cref="TenancyName"/> property.
        /// </summary>
        public const int MaxUserNameOrEmailAddressLength = 255;

        /// <summary>
        /// Maximum length of <see cref="ClientIpAddress"/> property.
        /// </summary>
        public const int MaxClientIpAddressLength = 64;

        /// <summary>
        /// Maximum length of <see cref="ClientName"/> property.
        /// </summary>
        public const int MaxClientNameLength = 128;

        /// <summary>
        /// Maximum length of <see cref="BrowserInfo"/> property.
        /// </summary>
        public const int MaxBrowserInfoLength = 512;

        /// <summary>
        /// Tenant's Id, if <see cref="TenancyName"/> was a valid tenant name.
        /// </summary>
        public virtual int? TenantId { get; set; }

        /// <summary>
        /// Tenancy name.
        /// </summary>
        [MaxLength(MaxTenancyNameLength)]
        public virtual string? TenancyName { get; set; }

        /// <summary>
        /// User's Id, if <see cref="UserNameOrEmailAddress"/> was a valid username or email address.
        /// </summary>
        public virtual long? UserId { get; set; }

        /// <summary>
        /// User name or email address
        /// </summary>
        [MaxLength(MaxUserNameOrEmailAddressLength)]
        public virtual string UserNameOrEmailAddress { get; set; }

        /// <summary>
        /// IP address of the client.
        /// </summary>
        [MaxLength(MaxClientIpAddressLength)]
        public virtual string? ClientIpAddress { get; set; }

        /// <summary>
        /// Name (generally computer name) of the client.
        /// </summary>
        [MaxLength(MaxClientNameLength)]
        public virtual string? ClientName { get; set; }

        /// <summary>
        /// Browser information if this method is called in a web request.
        /// </summary>
        [MaxLength(MaxBrowserInfoLength)]
        public virtual string? BrowserInfo { get; set; }

        /// <summary>
        /// Login attempt result.
        /// </summary>
        public virtual ShaLoginResultType Result { get; set; }

        public virtual DateTime CreationTime { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="UserLoginAttempt"/> class.
        /// </summary>
        public ShaUserLoginAttempt()
        {
            CreationTime = Clock.Now;
        }

        [MaxLength(20)]
        public virtual string? IMEI { get; set; }
        [MaxLength(255)]
        public virtual string? DeviceName { get; set; }

        public virtual int? LoginAttemptNumber { get; set; }
    }

}
