using Microsoft.AspNetCore.Mvc;
using Shesha.Services;
using System.Threading.Tasks;

namespace Shesha.Sms.Xml2Sms
{
    /// inheritDoc
    public class Xml2SmsAppService : IXml2SmsAppService
    {
        private readonly IXml2SmsGateway _gateway;

        /// <summary>
        /// Default constructor
        /// </summary>
        public Xml2SmsAppService(IXml2SmsGateway gateway)
        {
            _gateway = gateway;
        }

        /// inheritDoc
        [HttpPut, Route("api/Xml2Sms/Settings")]
        public async Task<bool> UpdateSettingsAsync(Xml2SmsSettingDto input)
        {
            await _gateway.SetTypedSettingsAsync(input);

            return true;
        }

        /// inheritDoc
        [HttpGet, Route("api/Xml2Sms/Settings")]
        public async Task<Xml2SmsSettingDto> GetSettingsAsync()
        {
            return await _gateway.GetTypedSettingsAsync();
        }

        public async Task TestSms(string mobileNumber, string body)
        {
            var gateway = StaticContext.IocManager.Resolve<ISmsGateway>();
            await gateway.SendSmsAsync(mobileNumber, body);
        }
    }
}
