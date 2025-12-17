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
        /// User lockout in seconds
        /// </summary>
        [Display(Name = "Security Settings")]
        [Setting(SheshaSettingNames.SecuritySettings, EditorFormName = "security-settings")]
        ISettingAccessor<SecuritySettings> SecuritySettings { get; set; }
    }
}
