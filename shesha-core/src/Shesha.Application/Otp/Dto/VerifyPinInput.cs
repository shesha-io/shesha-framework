using System;

namespace Shesha.Otp.Dto
{
    /// <summary>
    /// Verify OTP input
    /// </summary>
    public class VerifyPinInput
    {
        /// <summary>
        /// Unique runtime identifier of the operation. Is used for resending
        /// </summary>
        public Guid OperationId { get; set; }

        /// <summary>
        /// Value of the One Time Pin
        /// </summary>
        public string Pin { get; set; }
    }
}
