using System.Threading.Tasks;
using Abp.Application.Services;

namespace Shesha.Sms.Xml2Sms
{
    /// <summary>
    /// Xml2Sms application service. Allows to send SMS messages using Xml2Sms gateway
    /// </summary>
    public interface IXml2SmsAppService : IApplicationService
    {
        /// <summary>
        /// Updates Xml2Sms settings
        /// </summary>
        Task<bool> UpdateSettingsAsync(Xml2SmsSettingDto input);

        /// <summary>
        /// Returns current Xml2Sms settings
        /// </summary>
        Task<Xml2SmsSettingDto> GetSettingsAsync();
    }
}
