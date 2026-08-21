using Abp.Runtime.Session;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Shesha.Sms.Clickatell
{
    /// inheritDoc
    public class ClickatellAppService : IClickatellAppService
    {

        /// <summary>
        /// Reference to the current Session.
        /// </summary>
        public IAbpSession AbpSession { get; set; }

        private readonly IClickatellSmsGateway _gateway;

        /// <summary>
        /// Default constructor
        /// </summary>
        public ClickatellAppService(IClickatellSmsGateway clickatellSmsGateway)
        {
            _gateway = clickatellSmsGateway;

            AbpSession = NullAbpSession.Instance;
        }

        /// inheritDoc
        [HttpPut, Route("api/Clickatell/Settings")]
        public async Task<bool> UpdateSettingsAsync(ClickatellSettingDto input)
        {
            await _gateway.SetTypedSettingsAsync(input);

            return true;
        }

        /// inheritDoc
        [HttpGet, Route("api/Clickatell/Settings")]
        public async Task<ClickatellSettingDto> GetSettingsAsync()
        {
            return await _gateway.GetTypedSettingsAsync();
        }

        [Authorize]
        public async Task TestSmsAsync(string mobileNumber, string body)
        {
            await _gateway.SendSmsAsync(mobileNumber, body);
        }
    }
}
