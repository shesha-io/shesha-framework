using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications.Emails.Gateways
{
    public interface IEmailGatewayFactory
    {
        IEmailGateway GetGateway(string gatewayName);
    }
}
