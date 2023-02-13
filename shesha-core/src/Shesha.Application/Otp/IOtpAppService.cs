using System;
using System.Threading.Tasks;
using Abp.Application.Services;
using Shesha.Otp.Dto;

namespace Shesha.Otp
{
    /// <summary>
    /// Interface of the one-time-pin service
    /// </summary>
    public interface IOtpAppService: IApplicationService
    {
        /// <summary>
        /// Send one-time-pin
        /// </summary>
        Task<SendPinDto> SendPinAsync(SendPinInput input);

        /// <summary>
        /// Resend one-time-pin
        /// </summary>
        Task<SendPinDto> ResendPinAsync(ResendPinInput input);

        /// <summary>
        /// Verify one-time-pin
        /// </summary>
        Task<VerifyPinResponse> VerifyPinAsync(VerifyPinInput input);

        /// <summary>
        /// Get OTP
        /// </summary>
        /// <param name="operationId"></param>
        /// <returns></returns>
        [Obsolete("Added as a temporary solution, to be removed later")]
        Task<OtpDto> GetAsync(Guid operationId);
    }
}
