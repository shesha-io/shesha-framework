using System.Threading.Tasks;
using Abp.Application.Services;

namespace Shesha.Sms.Clickatell
{
    /// <summary>
    /// Clickatell SMS application service. Allows to send SMS messages using Clickatell gateway
    /// </summary>
    public interface IClickatellAppService: IApplicationService
    {
        /// <summary>
        /// Updates Clickatell settings
        /// </summary>
        Task<bool> UpdateSettingsAsync(ClickatellSettingDto input);

        /// <summary>
        /// Returns current Clickatell settings
        /// </summary>
        Task<ClickatellSettingDto> GetSettingsAsync();
    }
}
