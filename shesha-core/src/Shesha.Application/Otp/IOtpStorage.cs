using System;
using System.Threading.Tasks;
using Shesha.Otp.Dto;

namespace Shesha.Otp
{
    /// <summary>
    /// Storage of the One Time Pins
    /// </summary>
    public interface IOtpStorage
    {
        /// <summary>
        /// Save OTP
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        Task SaveAsync(OtpDto input);

        /// <summary>
        /// Update OTP (is used to update status, lifetime)
        /// </summary>
        /// <param name="operationId"></param>
        /// <param name="updateAction"></param>
        /// <returns></returns>
        Task UpdateAsync(Guid operationId, Func<OtpDto, Task> updateAction);

        /// <summary>
        /// Get OTP
        /// </summary>
        Task<OtpDto?> GetOrNullAsync(Guid operationId);

        /// <summary>
        /// Get OTP
        /// </summary>
        Task<OtpDto> GetAsync(Guid operationId);
    }
}
