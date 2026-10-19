using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Threading.Tasks;

namespace Shesha.Authentication
{
    /// <summary>
    /// Custom handler of `OnMessageReceived` event of JWT Bearer authentication.
    /// Called by `JwtBearerAuthenticationEvents.OnMessageReceived`
    /// </summary>
    public interface IJwtBearerOnMessageReceivedHandler
    {
        /// <summary>
        /// Invoked when a protocol message is first received.
        /// </summary>
        Task OnMessageReceivedAsync(MessageReceivedContext context);
    }
}
