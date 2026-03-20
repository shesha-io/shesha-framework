using Abp.Zero.Configuration;
using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Configuration.Security
{
    [Category("Security")]
    public interface ISecuritySettings: ISettingAccessors
    {
        /// <summary>
        /// Is user lockout enabled
        /// </summary>
        [Display(Name = "Is user lockout enabled")]
        [Setting(AbpZeroSettingNames.UserManagement.UserLockOut.IsEnabled, IsClientSpecific = true)]
        ISettingAccessor<bool> UserLockOutEnabled { get; }

        /// <summary>
        /// Max failed login attempts before lockout
        /// </summary>
        [Display(Name = "Max failed login attempts before lockout")]
        [Setting(AbpZeroSettingNames.UserManagement.UserLockOut.MaxFailedAccessAttemptsBeforeLockout, IsClientSpecific = true)]
        ISettingAccessor<int> MaxFailedAccessAttemptsBeforeLockout { get; }

        /// <summary>
        /// User lockout in seconds
        /// </summary>
        [Display(Name = "User lockout (sec)")]
        [Setting(AbpZeroSettingNames.UserManagement.UserLockOut.DefaultAccountLockoutSeconds, IsClientSpecific = true)]
        ISettingAccessor<int> DefaultAccountLockoutSeconds { get; }

        /// <summary>
        /// User lockout in seconds
        /// </summary>
        [Display(Name = "Security Settings")]
        [Setting(SheshaSettingNames.SecuritySettings, EditorFormName = "security-settings")]
        ISettingAccessor<SecuritySettings> SecuritySettings { get; set; }
    }
}
