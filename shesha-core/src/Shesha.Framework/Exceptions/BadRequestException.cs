using Abp.UI;

namespace Shesha.Exceptions
{
    /// <summary>
    /// A user friendly exception for a request that can't be processed because of what the client sent, e.g. an unknown
    /// username. Returned to the client as HTTP 400 (Bad Request)
    /// </summary>
    public class BadRequestException : UserFriendlyException
    {
        public BadRequestException(string message) : base(message)
        {
        }
    }
}
