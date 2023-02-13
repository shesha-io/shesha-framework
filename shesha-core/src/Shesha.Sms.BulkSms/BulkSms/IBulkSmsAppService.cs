using System.Threading.Tasks;

namespace Shesha.Sms.BulkSms
{
    /// <summary>
    /// Bulk SMS Gateway service
    /// </summary>
    public interface IBulkSmsAppService
    {
        /// <summary>
        /// Get Bulk SMS settings
        /// </summary>
        Task<BulkSmsSettingsDto> GetSettingsAsync();

        /// <summary>
        /// Update Bulk SMS settings
        /// </summary>
        Task UpdateSettingsAsync(BulkSmsSettingsDto input);
    }
}
