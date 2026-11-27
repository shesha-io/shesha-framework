using Abp.UI;

namespace Shesha.Exceptions
{
    /// <summary>
    /// A user friendly exception for a request that is refused because a limit was reached, e.g. an OTP was requested
    /// too often. Returned to the client as HTTP 429 (Too Many Requests), with a Retry-After header when
    /// <see cref="RetryAfterSeconds"/> is known
    /// </summary>
    public class TooManyRequestsException : UserFriendlyException
    {
        /// <summary>
        /// Seconds until the request may be made again, or null when that isn't known
        /// </summary>
        public int? RetryAfterSeconds { get; }

        public TooManyRequestsException(string message) : base(message)
        {
        }

        public TooManyRequestsException(string message, int retryAfterSeconds) : base(message)
        {
            RetryAfterSeconds = retryAfterSeconds;
        }
    }
}
