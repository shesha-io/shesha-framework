using System;

namespace Shesha.Otp.Dto
{
    /// <summary>
    /// Sending/resending OTP response
    /// </summary>
    public interface ISendPinResponse
    {
        /// <summary>
        /// Unique runtime identifier of the operation. Is used for resending
        /// </summary>
        Guid OperationId { get; }

        /// <summary>
        /// Mobile number/email address (depending on the `send type`) to which the OTP has been sent. Is used when we send OTP to the user or another entity
        /// </summary>
        string SentTo { get; }
    }
}
