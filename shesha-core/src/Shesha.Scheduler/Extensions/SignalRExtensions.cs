using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Shesha.Scheduler.SignalR;

namespace Shesha.Scheduler.Extensions
{
    public static class SignalRExtensions
    {
        public static IEndpointRouteBuilder MapSignalRHubs(this IEndpointRouteBuilder endpoints)
        {
            // todo: add conventional registration
            endpoints.MapHub<SignalrAppenderHub>("/signalr-appender");
            
            return endpoints;
        }
    }
}
