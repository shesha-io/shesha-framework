using Abp.Application.Services;

namespace Shesha.Otp
{
    /// <summary>
    /// Interface of the one-time-pin service
    /// </summary>
    public interface IOtpAppService: IOtpManager, IApplicationService
    {
    }
}
