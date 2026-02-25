using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Shesha.Settings;

namespace Shesha.Configuration.Security.Frontend
{
    [Category("Security")]
    public interface IUserManagementSettings : ISettingAccessors
    {
        /// <summary>
        /// New User Registration
        /// </summary>
        [Display(Name = "New User Registration")]
        [Setting(UserManagementSettingNames.UserManagement, EditorFormName = "user-management-settings", IsClientSpecific = true)]
        ISettingAccessor<UserManagementSettings> UserManagementSettings { get; }
    }
}
