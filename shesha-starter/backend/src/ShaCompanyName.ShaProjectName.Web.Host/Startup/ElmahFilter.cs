using ElmahCore;
using RabbitMQ.Client.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Threading.Tasks;
using Shesha.Elmah;

namespace ShaCompanyName.ShaProjectName.Web.Host.Startup
{
    /// <summary>
    /// Fitlers out unwanted Elmah exceptions.
    /// </summary>
    public class ElmahFilter : IErrorFilter
    {
        public void OnErrorModuleFiltering(object sender, ExceptionFilterEventArgs args)
        {
            // Fitlering out a recurrent error which is flooding the Elmah logs until can be addressed at root
            if (args.Exception is SocketException && args.Exception.Message.StartsWith("A connection attempt failed") ||
                args.Exception is BrokerUnreachableException)
            {
                args.Dismiss();
                args.Exception.MarkExceptionAsLogged();
            }
        }
    }
}
