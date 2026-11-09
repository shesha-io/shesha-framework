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
        [Display(Name = "User Management Settings")]
        [Setting(UserManagementSettingNames.UserManagement, EditorFormName = "user-management-settings")]
        ISettingAccessor<UserManagementSettings> UserManagementSettings { get; }
    }
}
