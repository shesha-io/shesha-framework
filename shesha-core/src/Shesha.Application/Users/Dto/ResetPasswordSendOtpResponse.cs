using System;

namespace Shesha.Users.Dto
{
    public class ResetPasswordSendOtpResponse
    {
        /// <summary>
        /// Unique runtime identifier of the operation. Is used for resending
        /// </summary>
        public Guid OperationId { get; set; }
    }
}
