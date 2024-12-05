using Microsoft.Extensions.DependencyInjection;
using Shesha.Notifications.Emails.Gateways;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications.Sms.Gateways
{
    public interface ISmsGatewayFactory
    {
        ISmsGateway GetGateway(string gatewayName);
    }
}
