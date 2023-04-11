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
        /// SMS Gateway
        /// </summary>
        [Display(Name = "SMS Gateway")]
        [Setting(SheshaSettingNames.Sms.SmsGateway, false, "sms-settings-gateway")]
        ISettingAccessor<string> SmsGateway { get; }

        /// <summary>
        /// Redirect all messages to.
        /// Is used for testing purposes only
        /// </summary>
        [Display(Name = "Redirect all messages to", Description = "Is used for testing purposes only")]
        [Setting(SheshaSettingNames.Sms.RedirectAllMessagesTo)]
        ISettingAccessor<string> RedirectAllMessagesTo { get; }
    }
}
