using System;

namespace Shesha.Otp.Dto
{
    public class SendPinDto
    {
        /// <summary>
        /// Unique runtime identifier of the operation. Is used for resending
        /// </summary>
        public Guid OperationId { get; set; }

        /// <summary>
        /// Mobile number/email address (depending on the `send type`) to which the OTP has been sent. Is used when we send OTP to the user or another entity
        /// </summary>
        public string SentTo { get; set; }
    }
}
