using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications.Emails.Gateways
{
    public class EmailGatewayFactory: IEmailGatewayFactory
    {
        private readonly IEnumerable<IEmailGateway> _emailGateways;

        public EmailGatewayFactory(IEnumerable<IEmailGateway> emailGateways)
        {
            _emailGateways = emailGateways;
        }

        public IEmailGateway GetGateway(string gatewayName)
        {
            var gateway = _emailGateways.FirstOrDefault(g => g.Name.Equals(gatewayName, StringComparison.OrdinalIgnoreCase));

            if (gateway == null)
                throw new NotSupportedException($"Gateway '{gatewayName}' is not supported. Available gateways: {string.Join(", ", _emailGateways.Select(g => g.Name))}");

            return gateway;
        }
    }
}
