using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Shesha.Settings;

namespace Shesha.Configuration.Security.Frontend
{
    [Category("Security")]
    public interface ISqlAuthenticationSettings : ISettingAccessors
    {
        /// <summary>
        /// Default authentication settings
        /// </summary>
        [Display(Name = "Default Authentication")]
        [Setting(UserManagementSettingNames.SqlAuthentication, EditorFormName = "default-authentication-settings", IsClientSpecific = true)]
        ISettingAccessor<SqlAuthenticationSettings> SqlAuthentication { get; }
    }
}
