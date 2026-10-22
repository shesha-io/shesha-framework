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

        [SheshaAuthorize(Domain.Enums.RefListPermissionedAccess.AnyAuthenticated)]
        [HttpPost]
        [Route("api/Sms/Test")]
        public async Task<SendStatus> TestSmsAsync(string mobileNumber, string body)
        {
            var gateway = await _smsGatewayFactory.GetSmsGatewayAsync();
            return await gateway.SendSmsAsync(mobileNumber, body);
        }
    }
}
