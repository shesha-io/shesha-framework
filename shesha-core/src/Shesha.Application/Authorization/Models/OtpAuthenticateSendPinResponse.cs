using System;

namespace Shesha.Authorization.Models
{
    /// <summary>
    /// Response generated after sending of the authentication one-time pin
    /// </summary>
    public class OtpAuthenticateSendPinResponse
    {
        /// <summary>
        /// Unique runtime identifier of the operation. Is used for resending
        /// </summary>
        public Guid OperationId { get; set; }
    }
}
