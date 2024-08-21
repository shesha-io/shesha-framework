using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Sms.Clickatell
{
    /// <summary>
    /// Clickatell settings
    /// </summary>
    [Category("SMS")]
    public interface IClickatellSettings : ISettingAccessors
    {
        /// <summary>
        /// Clickatell Gateway
        /// </summary>
        [Display(Name = "Clickatell Gateway")]
        [Setting(ClickatellSettingNames.GatewaySettings, EditorFormName = "gateway-settings")]
        ISettingAccessor<GatewaySettings> ClickatellGateway { get; }
    }
}
