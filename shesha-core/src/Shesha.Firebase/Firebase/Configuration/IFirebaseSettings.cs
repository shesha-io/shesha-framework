using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Firebase.Configuration
{
    /// <summary>
    /// Firebase settings
    /// </summary>
    [Category("Firebase")]
    public interface IFirebaseSettings : ISettingAccessors
    {
        /// <summary>
        /// Service Account JSON
        /// </summary>
        [Display(Name = "Service Account JSON")]
        [Setting(FirebaseSettingNames.ServiceAccountJson)]
        ISettingAccessor<string> ServiceAccountJson { get; }
    }
}
