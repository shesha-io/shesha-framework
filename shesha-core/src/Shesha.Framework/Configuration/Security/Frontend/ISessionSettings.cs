using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Shesha.Settings;

namespace Shesha.Configuration.Security.Frontend
{
    [Category("Security")]
    public interface ISessionSettings : ISettingAccessors
    {
        /// <summary>
        /// General
        /// </summary>
        [Display(Name = "General")]
        [Setting(UserManagementSettingNames.GeneralFrontendSecuritySettings, EditorFormName = "general-frontend-security-settings", IsClientSpecific = true)]
        ISettingAccessor<GeneralFrontendSecuritySettings> GeneralFrontendSecuritySettings { get; }
    }
}
