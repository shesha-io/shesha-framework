using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.OmoNotifications.Sms.Gateways
{
    public class SmsGatewayFactory
    {
        private readonly IServiceProvider _serviceProvider;

        public SmsGatewayFactory(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public ISmsGateway GetGateway(string gatewayName)
        {
            return gatewayName switch
            {
                "ClickatellGateway" => _serviceProvider.GetService<ClickatellGateway>(),
                // Add other gateways here
                _ => throw new NotSupportedException($"Gateway {gatewayName} is not supported.")
            };
        }
    }
}
