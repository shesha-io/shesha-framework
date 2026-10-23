using Abp.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Shesha.Authorization;
using Shesha.Notifications.Dto;
using Shesha.Sms.Dtos;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Sms
{
    public class SmsGatewaysAppService: ApplicationService
    {
        private readonly ISmsGatewayFactory _smsGatewayFactory;

        public SmsGatewaysAppService(ISmsGatewayFactory smsGatewayFactory)
        {
            _smsGatewayFactory = smsGatewayFactory;
        }

        [HttpGet]
        [Route("api/Sms/Gateways")]
        public List<SmsGatewayDto> GetAll()
        {
            return _smsGatewayFactory.GetSmsGatewayTypes()
                .Select(t => new SmsGatewayDto { 
                    Uid = t.Uid,
                    Alias = t.Alias,
                    Name = t.Name,
                    Description = t.Description
                })
                .OrderBy(i => i.Name)
                .ToList();
        }

        /// <summary>
        /// Sends a test SMS through the gateway currently selected in settings, then releases that gateway.
        /// </summary>
        /// <param name="mobileNumber">Destination mobile number.</param>
        /// <param name="body">Message body.</param>
        /// <returns>The selected gateway's send result.</returns>
        [SheshaAuthorize(Domain.Enums.RefListPermissionedAccess.AnyAuthenticated)]
        [HttpPost]
        [Route("api/Sms/Test")]
        public async Task<SendStatus> TestSmsAsync(string mobileNumber, string body)
        {
            var gateway = await _smsGatewayFactory.GetSmsGatewayAsync();
            try
            {
                return await gateway.SendSmsAsync(mobileNumber, body);
            }
            finally
            {
                _smsGatewayFactory.ReleaseGateway(gateway);
            }
        }
    }
}
