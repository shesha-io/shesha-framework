using Abp.UI;

namespace Shesha.Exceptions
{
    /// <summary>
    /// A user friendly exception for a request that is refused because a limit was reached, e.g. an OTP was requested
    /// too often. Returned to the client as HTTP 429 (Too Many Requests)
    /// </summary>
    public class TooManyRequestsException : UserFriendlyException
    {
        public TooManyRequestsException(string message) : base(message)
        {
        }
    }
}
