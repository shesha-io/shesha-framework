using Shesha.Settings;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.UserManagements.Configurations
{
    [Category("User Management")]
    public interface IUserManagementSettings: ISettingAccessors
    {
        /// <summary>
        /// User Management Settings
        /// </summary>
        /// <remarks>
        /// Client-specific so that e.g. a public portal can allow self-registration while an admin portal does not.
        /// Read it through ISelfRegistrationSettingsProvider, which falls back to the value saved without a
        /// front-end application when the current application has no value of its own.
        /// </remarks>
        [Display(Name = "User Management Settings")]
        [Setting(UserManagementSettingNames.UserManagement, EditorFormName = "user-management-settings", IsClientSpecific = true)]
        ISettingAccessor<UserManagementSettings> UserManagementSettings { get; }
    }
}
