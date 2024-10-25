using Abp.Application.Services;
using Shesha.Otp.Dto;
using System.Threading.Tasks;

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
        Task<ISendPinResponse> SendPinAsync(SendPinInput input);

        /// <summary>
        /// Resend one-time-pin
        /// </summary>
        Task<ISendPinResponse> ResendPinAsync(ResendPinInput input);

        /// <summary>
        /// Verify one-time-pin
        /// </summary>
        Task<IVerifyPinResponse> VerifyPinAsync(VerifyPinInput input);
    }
}
