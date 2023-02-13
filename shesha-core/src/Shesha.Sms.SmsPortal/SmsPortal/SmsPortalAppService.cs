using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Shesha.Sms.SmsPortal
{
    /// inheritedDoc
    public class SmsPortalAppService: ISmsPortalAppService
    {
        private readonly ISmsPortalGateway _gateway;

        /// <summary>
        /// Default constructor
        /// </summary>
        public SmsPortalAppService(ISmsPortalGateway gateway)
        {
            _gateway = gateway;
        }

        /// inheritedDoc
        [HttpPut, Route("api/SmsPortal/Settings")]
        public async Task<bool> UpdateSettingsAsync(SmsPortalSettingsDto input)
        {
            await _gateway.SetTypedSettingsAsync(input);

            return true;

        }

        /// inheritedDoc
        [HttpGet, Route("api/SmsPortal/Settings")]
        public async Task<SmsPortalSettingsDto> GetSettingsAsync()
        {
            return await _gateway.GetTypedSettingsAsync();
        }
    }
}
