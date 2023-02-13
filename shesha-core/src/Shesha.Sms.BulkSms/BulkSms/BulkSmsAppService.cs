using Abp.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Shesha.Sms.BulkSms
{
    /// <summary>
    /// Bulk SMS Gateway service
    /// </summary>
    [AbpAuthorize()]
    public class BulkSmsAppService : SheshaAppServiceBase, IBulkSmsAppService
    {
        private readonly IBulkSmsGateway _gateway;

        /// <summary>
        /// Default constructor
        /// </summary>
        public BulkSmsAppService(IBulkSmsGateway gateway)
        {
            _gateway = gateway;
        }

        /// <summary>
        /// Get Bulk SMS settings
        /// </summary>
        [HttpGet, Route("api/BulkSmsGateway/Settings")]
        public async Task<BulkSmsSettingsDto> GetSettingsAsync()
        {
            return await _gateway.GetTypedSettingsAsync();
        }

        /// <summary>
        /// Update Bulk SMS settings
        /// </summary>
        [HttpPut, Route("api/BulkSmsGateway/Settings")]
        public async Task UpdateSettingsAsync(BulkSmsSettingsDto input)
        {
            await _gateway.SetTypedSettingsAsync(input);
        }
    }
}
