using System;

namespace Shesha.Otp.Dto
{
    /// <summary>
    /// OTP verification input
    /// </summary>
    public interface IVerifyPinInput
    {
        /// <summary>
        /// Unique runtime identifier of the operation. Is used for resending
        /// </summary>
        Guid OperationId { get; }

        /// <summary>
        /// Value of the One Time Pin
        /// </summary>
        string Pin { get; }
    }
}
