using Shesha.Otp.Dto;
using System;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    public interface IOtpManager
    {
        /// <summary>
        /// Send one-time-pin
        /// </summary>
        Task<ISendPinResponse> SendPinAsync(SendPinInput input);

        /// <summary>
        /// Resend one-time-pin
        /// </summary>
        Task<ISendPinResponse> ResendPinAsync(ResendPinInput input);

        /// <summary>
        /// Verifies a one-time-pin: checks the pin and its expiry, counts the attempt against the attempt limit and marks the
        /// OTP as used. Once it has succeeded, the same OTP can't be verified again, so call it once per operation and use
        /// <see cref="GetAsync"/> to read the OTP's details (e.g. where it was sent).
        /// </summary>
        Task<IVerifyPinResponse> VerifyPinAsync(VerifyPinInput input);

        /// <summary>
        /// Get OTP
        /// </summary>
        /// <param name="operationId"></param>
        /// <returns></returns>
        Task<IOtpDto> GetAsync(Guid operationId);
    }
}
