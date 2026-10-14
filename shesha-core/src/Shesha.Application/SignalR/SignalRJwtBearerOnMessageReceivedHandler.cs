using Abp.Dependency;
using Abp.Runtime.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Shesha.Authentication;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.SignalR
{
    /// <summary>
    /// Handles JWT Bearer authentication for SignalR
    /// </summary>
    public class SignalRJwtBearerOnMessageReceivedHandler : IJwtBearerOnMessageReceivedHandler, ITransientDependency
    {
        public Task OnMessageReceivedAsync(MessageReceivedContext context)
        {
            var isSignalR = context.HttpContext.Request.Path.HasValue && context.HttpContext.Request.Path.Value.StartsWith("/signalr");
            if (isSignalR) 
            {
                var qsAuthToken = context.HttpContext.Request.Query["enc_auth_token"].FirstOrDefault();
                
                // Set auth token from query string if available
                if (!string.IsNullOrWhiteSpace(qsAuthToken))
                    context.Token = SimpleStringCipher.Instance.Decrypt(qsAuthToken, AppConsts.DefaultPassPhrase);
            }

            return Task.CompletedTask;
        }
    }
}
