using Shesha.Configuration;
using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Sms.Configuration
{
    /// <summary>
    /// SMS Settings
    /// </summary>
    [Category("SMS")]
    public interface ISmsSettings : ISettingAccessors
    {
        /// <summary>
        /// SMS Settings
        /// </summary>
        [Display(Name = "SMS Gateway")]
        [Setting(SheshaSettingNames.SmsSettings, false, "sms-settings")]
        ISettingAccessor<SmsSettings> SmsSettings { get; }
    }
}
