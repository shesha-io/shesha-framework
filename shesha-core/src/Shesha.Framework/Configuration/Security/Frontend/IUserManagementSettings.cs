using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Shesha.Settings;

namespace Shesha.Configuration.Security.Frontend
{
    [Category("Security")]
    public interface IUserManagementSettings : ISettingAccessors
    {
        /// <summary>
        /// User Management Settings
        /// </summary>
        [Display(Name = "New User Registration")]
        [Setting(UserManagementSettingNames.UserManagement, EditorFormName = "user-management-settings", IsClientSpecific = true)]
        ISettingAccessor<UserManagementSettings> UserManagementSettings { get; }

        /// <summary>
        /// General
        /// </summary>
        [Display(Name = "General")]
        [Setting(UserManagementSettingNames.GeneralFrontendSecuritySettings, EditorFormName = "general-frontend-security-settings", IsClientSpecific = true)]
        ISettingAccessor<GeneralFrontendSecuritySettings> GeneralFrontendSecuritySettings { get; }

        /// <summary>
        /// Default authentication settings
        /// </summary>
        [Display(Name = "Default Authentication")]
        [Setting(UserManagementSettingNames.SqlAuthentication, EditorFormName = "default-authentication-settings", IsClientSpecific = true)]
        ISettingAccessor<SqlAuthenticationSettings> SqlAuthentication { get; }
    }
}
