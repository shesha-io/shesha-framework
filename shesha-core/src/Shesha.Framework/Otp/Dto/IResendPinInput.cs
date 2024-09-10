using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Otp.Dto
{
    /// <summary>
    /// OTP resending input
    /// </summary>
    public interface IResendPinInput
    {
        /// <summary>
        /// Unique runtime identifier of the operation
        /// </summary>
        [Required]
        Guid OperationId { get; }

        /// <summary>
        /// Lifetime of the one time password in seconds
        /// </summary>
        Int64? Lifetime { get; }
    }
}
