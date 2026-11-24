using Abp.UI;

namespace Shesha.Exceptions
{
    /// <summary>
    /// A user friendly exception for a one-time pin, link or token that can't be verified (wrong, expired or already used).
    /// Returned to the client as HTTP 400 (Bad Request)
    /// </summary>
    public class VerificationFailedException : UserFriendlyException
    {
        public VerificationFailedException(string message) : base(message)
        {
        }
    }
}
