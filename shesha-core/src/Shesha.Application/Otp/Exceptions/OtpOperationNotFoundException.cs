using System;

namespace Shesha.Otp.Exceptions
{
    public class OtpOperationNotFoundException : OtpException
    {
        public Guid OperationId { get; private set; }

        public OtpOperationNotFoundException(Guid operationId): base($"PIN for operation '{operationId}' not found")
        {
            OperationId = operationId;
        }
    }
}
