using Microsoft.Extensions.DependencyInjection;
using Shesha.Notifications.Emails.Gateways;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications.Sms.Gateways
{
    public class SmsGatewayFactory: ISmsGatewayFactory
    {
        private readonly IEnumerable<ISmsGateway> _smsGateways;

        public SmsGatewayFactory(IEnumerable<ISmsGateway> smsGateways)
        {
            _smsGateways = smsGateways;
        }

        public ISmsGateway GetGateway(string gatewayName)
        {
            var gateway = _smsGateways.FirstOrDefault(g => g.Name.Equals(gatewayName, StringComparison.OrdinalIgnoreCase));

            if (gateway == null)
                throw new NotSupportedException($"Gateway '{gatewayName}' is not supported. Available gateways: {string.Join(", ", _smsGateways.Select(g => g.Name))}");

            return gateway;
        }
    }
}
