using Abp.Dependency;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Shesha.Authentication;
using Shesha.Authentication.JwtBearer;
using System.Threading.Tasks;

namespace Shesha.Scheduler.Hangfire
{
    public class SchedulerJwtBearerOnMessageReceivedHandler : IJwtBearerOnMessageReceivedHandler, ITransientDependency
    {
        public Task OnMessageReceivedAsync(MessageReceivedContext context)
        {
            var isHangfire = !string.IsNullOrWhiteSpace(HangfireDashboardInfo.Path) &&
                context.HttpContext.Request.Path.StartsWithSegments(HangfireDashboardInfo.Path, System.StringComparison.OrdinalIgnoreCase);
            if (isHangfire)
            {
                var cookie = JwtExtensions.GetAuthTokenCookie(context.HttpContext);

                // Set auth token from cookie string if available
                if (!string.IsNullOrWhiteSpace(cookie))
                    context.Token = cookie;
            }

            return Task.CompletedTask;
        }
    }
}
