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
        /// Verify one-time-pin
        /// </summary>
        Task<IVerifyPinResponse> VerifyPinAsync(VerifyPinInput input);

        /// <summary>
        /// Verify one-time-pin. With <paramref name="acceptUsed"/> set, an OTP that was already used is accepted too, as
        /// long as the pin matches and hasn't expired. Self-registration uses this because the client checks the pin
        /// through the Otp/VerifyPin endpoint (which uses it) before the registration is submitted with the same pin
        /// </summary>
        Task<IVerifyPinResponse> VerifyPinAsync(VerifyPinInput input, bool acceptUsed);

        /// <summary>
        /// Get OTP
        /// </summary>
        /// <param name="operationId"></param>
        /// <returns></returns>
        Task<IOtpDto> GetAsync(Guid operationId);

        /// <summary>
        /// Marks the OTP as used so that it can't be accepted again. Call it after a successful verification to make the
        /// OTP single-use; when called concurrently for the same OTP, only one call returns true.
        /// </summary>
        /// <param name="operationId"></param>
        /// <returns>True if the OTP was valid (not expired) and is now used, otherwise false</returns>
        Task<bool> TryConsumeAsync(Guid operationId);
    }
}
