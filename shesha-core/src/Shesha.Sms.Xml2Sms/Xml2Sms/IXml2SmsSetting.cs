using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Sms.Xml2Sms
{
    /// <summary>
    /// Xml2Sms settings
    /// </summary>
    [Category("Xml2Sms")]
    public interface IXml2SmsSetting : ISettingAccessors
    {
        /// <summary>
        /// Gateway Settings
        /// </summary>
        [Display(Name = "Gateway Settings")]
        [Setting(Xml2SmsSettingNames.GatewaySettings, EditorFormName = "gateway-settings")]
        ISettingAccessor<GatewaySettings> GatewaySettings { get; }
    }
}
