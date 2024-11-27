using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications.Emails.Gateways
{
    public class EmailGatewayFactory
    {
        private readonly IServiceProvider _serviceProvider;

        public EmailGatewayFactory(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public IEmailGateway GetGateway(string gatewayName)
        {
            return gatewayName switch
            {
                "SmtpGateway" => _serviceProvider.GetService<SmtpGateway>(),
                // Add other gateways here
                _ => throw new NotSupportedException($"Gateway {gatewayName} is not supported.")
            };
        }
    }
}
