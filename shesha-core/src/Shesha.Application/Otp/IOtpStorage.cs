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
        /// <param name="operationId"></param>
        /// <returns></returns>
        Task<OtpDto> GetAsync(Guid operationId);

        /// <summary>
        /// Increments the number of verification attempts of the OTP and returns the new value.
        /// Implementations should make the increment atomic so that concurrent requests can't exceed the attempt limit.
        /// </summary>
        /// <param name="operationId"></param>
        /// <returns>Number of verification attempts including the current one</returns>
        Task<int> IncrementVerifyAttemptsAsync(Guid operationId);
    }
}
