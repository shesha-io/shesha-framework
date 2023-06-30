using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Sms.Clickatell
{
    /// <summary>
    /// Clickatell settings
    /// </summary>
    [Category("Clickatell")]
    public interface IClickatellSettings : ISettingAccessors
    {
        /// <summary>
        /// Gateway Settings
        /// </summary>
        [Display(Name = "Gateway Settings")]
        [Setting(ClickatellSettingNames.GatewaySettings, EditorFormName = "gateway-settings")]
        ISettingAccessor<GatewaySettings> GatewaySettings { get; }
    }
}
