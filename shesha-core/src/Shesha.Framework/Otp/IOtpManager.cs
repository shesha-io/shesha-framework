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
        /// <see cref="GetOrNullAsync"/> to read the OTP's details (e.g. where it was sent).
        /// </summary>
        Task<IVerifyPinResponse> VerifyPinAsync(VerifyPinInput input);

        /// <summary>
        /// Returns true when <see cref="VerifyPinAsync"/> would accept the pin, without counting an attempt or marking the OTP
        /// as used. Use it to check the pin before other checks that may still fail, then verify it with <see cref="VerifyPinAsync"/>.
        /// Like <see cref="VerifyPinAsync"/>, it accepts any pin when the IgnoreOtpValidation setting is on.
        /// </summary>
        Task<bool> IsPinValidAsync(Guid operationId, string pin);

        /// <summary>
        /// Get OTP
        /// </summary>
        /// <param name="operationId"></param>
        /// <returns></returns>
        Task<IOtpDto?> GetOrNullAsync(Guid operationId);
    }
}
