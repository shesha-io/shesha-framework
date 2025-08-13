using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Authorization.Users;
using Abp.Extensions;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using Shesha.EntityHistory;

namespace Shesha.Authorization.Users
{
    [Table("AbpUsers")]
    public class User : AbpUser<User>
    {
        public const string DefaultPassword = "123qwe";

        public User()
        {
            Claims = new List<UserClaim>();
            Roles = new List<UserRole>();
            TypeOfAccount = RefListTypeOfAccount.Internal;
        }

        public virtual DateTime? LastLoginDate { get; set; }

        public static string CreateRandomPassword()
        {
            return Guid.NewGuid().ToString("N").Truncate(16);
        }

        /// <summary>
        /// Email address of the user.
        /// Email address must be unique for it's tenant.
        /// </summary>
        [MaxLength(MaxEmailAddressLength)]
        public override string? EmailAddress { get; set; }         

        public override void SetNormalizedNames()
        {
            NormalizedUserName = UserName.ToUpperInvariant();
            NormalizedEmailAddress = EmailAddress?.ToUpperInvariant();
        }

        [Display(Name = "Authentication Guid")]
        [MaxLength(36)]
        public virtual string? AuthenticationGuid { get; set; }

        [Display(Name = "Authentication Guid Expiry Date")]
        public virtual DateTime? AuthenticationGuidExpiresOn { get; set; }

        /// <summary>
        /// One Time Passwords by SMS
        /// </summary>
        [DisplayFormat(DataFormatString = "Yes|No")]
        [Display(Name = "Use SMS Based One-Time-Passwords")]
        [AuditedBoolean("SMS Based One-Time-Passwords enabled", "SMS Based One-Time-Passwords disabled")]
        public virtual bool OtpEnabled { get; set; }

        [Display(Name = "Require a change of password")]
        public virtual bool RequireChangePassword { get; set; }
        /// <summary>
        /// 
        /// </summary>
        public virtual bool IsAnonymous { get; set; }
        /// <summary>
        /// Security question status
        /// </summary>
        [Display(Name = "Security Question Status")]
        public virtual RefListSecurityQuestionStatus? SecurityQuestionStatus { get; set; }

        /// <summary>
        /// 
        /// </summary>
        [Display(Name = "Require password change on next login")]
        public virtual bool ChangePasswordOnNextLogin { get; set; }

        /// <summary>
        /// 
        /// </summary>
        [Display(Name = "Password reset token expiry time")]
        public virtual DateTime? PasswordResetTokenExpiryTime { get; set; }

        /// <summary>
        /// Password reset methods supported.
        /// </summary>
        [Display(Name = "Supported password reset methods")]
        [MultiValueReferenceList("Shesha.Framework", "PasswordResetMethods")]
        public virtual long? SupportedPasswordResetMethods { get; set; }

        /// <summary>
        /// Is this user active?
        /// If as user is not active, he/she can not use the application.
        /// </summary>
        [AuditedAsEvent(typeof(IsLockedEventCreator))]
        public override bool IsActive { get; set; }


        [Display(Name = "Type of account")]
        public virtual RefListTypeOfAccount? TypeOfAccount { get; set; }

        [SaveAsJson]
        [Display(Name = "Allow only selected FrontEnd Applications", Description = "Leave empty to allow any FrontEnd Applications")]
        public virtual List<string>? AllowedFrontEndApps { get; set; }

        public static User CreateUser(int? tenantId, string username, string emailAddress)
        {
            var user = new User
            {
                TenantId = tenantId,
                UserName = username,
                Name = username,
                Surname = username,
                EmailAddress = emailAddress,
                Roles = new List<UserRole>(),
                TypeOfAccount = RefListTypeOfAccount.Internal,
            };

            user.SetNormalizedNames();

            return user;
        }

        public new const string AdminUserName = "admin";
        public const string DevUserName = "dev";
        public const string ConfigUserName = "config";

        public static User CreateTenantAdminUser(int tenantId, string emailAddress)
        {
            return CreateUser(tenantId, AdminUserName, emailAddress);
        }

        private class IsLockedEventCreator : EntityHistoryEventCreatorBase<User, bool>
        {
            public override EntityHistoryEventInfo CreateEvent(EntityChangesInfo<User, bool> change)
            {
                var text = change.NewValue ? "User locked" : "User unlocked";
                return CreateEvent(text, text);
            }
        }
    }
}
