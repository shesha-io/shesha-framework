using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Sms.SmsPortal
{
    /// <summary>
    /// SMS Portal settings
    /// </summary>
    [Category("SMS Portal")]
    public interface ISmsPortalSettings : ISettingAccessors
    {
        /// <summary>
        /// Gateway Settings
        /// </summary>
        [Display(Name = "Gateway Settings")]
        [Setting(SmsPortalSettingNames.GatewaySettings, EditorFormName = "gateway-settings")]
        ISettingAccessor<GatewaySettings> GatewaySettings { get; }
    }
}
