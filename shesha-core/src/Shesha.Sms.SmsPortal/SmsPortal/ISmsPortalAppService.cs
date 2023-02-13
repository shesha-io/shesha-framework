using System.Threading.Tasks;
using Abp.Application.Services;

namespace Shesha.Sms.SmsPortal
{
    /// <summary>
    /// Sms Portal application service. Allows to send SMS messages using SmsPortal gateway
    /// </summary>
    public interface ISmsPortalAppService: IApplicationService
    {
        /// <summary>
        /// Updates Sms Portal settings
        /// </summary>
        Task<bool> UpdateSettingsAsync(SmsPortalSettingsDto input);

        /// <summary>
        /// Returns current Sms Portal settings
        /// </summary>
        Task<SmsPortalSettingsDto> GetSettingsAsync();
    }
}
