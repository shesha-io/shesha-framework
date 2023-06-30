using DocumentFormat.OpenXml.Wordprocessing;
using Shesha.Settings;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Sms.BulkSms
{
    /// <summary>
    /// BulkSms settings
    /// </summary>
    [Category("Bulk SMS")]
    public interface IBulkSmsSettings : ISettingAccessors
    {
        /// <summary>
        /// Gateway Settings
        /// </summary>
        [Display(Name = "Gateway Settings")]
        [Setting(BulkSmsSettingNames.GatewaySettings, EditorFormName = "gateway-settings")]
        ISettingAccessor<GatewaySettings> GatewaySettings { get; }
    }
}
