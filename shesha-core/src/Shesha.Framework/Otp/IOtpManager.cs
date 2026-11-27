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
        /// The first half of <see cref="VerifyPinAsync"/>: counts the attempt against the attempt limit, then checks the pin and
        /// its expiry, without marking the OTP as used. Use it when other checks that may still fail come after the pin (e.g. the
        /// device on OTP login), then call <see cref="ConsumePinAsync"/> once they pass. The attempt is counted before the result
        /// is known, so concurrent requests can't compare more pins than the limit allows.
        /// Like <see cref="VerifyPinAsync"/>, it accepts any pin when the IgnoreOtpValidation setting is on.
        /// </summary>
        Task<IVerifyPinResponse> CheckPinAsync(VerifyPinInput input);

        /// <summary>
        /// The second half of <see cref="VerifyPinAsync"/>: marks a pin that <see cref="CheckPinAsync"/> accepted as used, after
        /// checking the pin and its expiry again. It doesn't count an attempt, and refuses an OTP that no attempt was counted for,
        /// so call it only after <see cref="CheckPinAsync"/> succeeded for the same pin. Of concurrent calls for the same OTP,
        /// only one succeeds.
        /// </summary>
        Task<IVerifyPinResponse> ConsumePinAsync(VerifyPinInput input);

        /// <summary>
        /// Get OTP
        /// </summary>
        /// <param name="operationId"></param>
        /// <returns></returns>
        Task<IOtpDto?> GetOrNullAsync(Guid operationId);
    }
}
