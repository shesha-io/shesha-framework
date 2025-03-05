using Shesha.Cache;
using Shesha.Otp.Dto;
using System;

namespace Shesha.Otp
{
    /// <summary>
    /// OTP cache
    /// </summary>
    public interface IOtpCache : ICacheHolder<Guid, OtpDto>
    {
    }
}
