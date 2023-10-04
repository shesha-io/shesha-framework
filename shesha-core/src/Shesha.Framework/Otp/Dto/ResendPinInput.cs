using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Otp.Dto
{
    public class ResendPinInput
    {
        /// <summary>
        /// Unique runtime identifier of the operation
        /// </summary>
        [Required]
        public Guid OperationId { get; set; }

        /// <summary>
        /// Lifetime of the one time password in seconds
        /// </summary>
        public Int64? Lifetime { get; set; }
    }
}
