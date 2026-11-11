using Abp.UI;
using Shesha.Locks;
using Shesha.Otp.Dto;
using System;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    public class CacheOtpStorage: IOtpStorage
    {
        private static readonly TimeSpan LockExpiry = TimeSpan.FromSeconds(30);
        private static readonly TimeSpan LockWait = TimeSpan.FromSeconds(10);
        private static readonly TimeSpan LockRetry = TimeSpan.FromMilliseconds(100);

        private readonly IOtpCache _otpCache;
        private readonly ILockFactory _lockFactory;

        public CacheOtpStorage(IOtpCache otpCache, ILockFactory lockFactory)
        {
            _otpCache = otpCache;
            _lockFactory = lockFactory;
        }

        /// inheritedDoc
        public async Task SaveAsync(OtpDto input)
        {
            if (input.ExpiresOn.HasValue && input.ExpiresOn.Value <= DateTime.Now)
                return;

            await _otpCache.Cache.SetAsync(input.OperationId, 
                input, 
                slidingExpireTime: input.ExpiresOn.HasValue
                    ? input.ExpiresOn.Value - DateTime.Now
                    : (TimeSpan?)null);
        }

        /// inheritedDoc
        /// <remarks>
        /// Runs under the same lock as <see cref="IncrementVerifyAttemptsAsync"/> so that an update can't overwrite
        /// attempts counted in the meantime
        /// </remarks>
        public async Task UpdateAsync(Guid operationId, Func<OtpDto, Task> updateAction)
        {
            var acquired = await _lockFactory.DoExclusiveAsync(GetLockKey(operationId), LockExpiry, LockWait, LockRetry, async () =>
            {
                var dto = await GetAsync(operationId);
                await updateAction.Invoke(dto);
                await SaveAsync(dto);
            });

            if (!acquired)
                throw new UserFriendlyException("The one-time pin is being processed, please try again");
        }

        /// inheritedDoc
        /// <remarks>
        /// The cache has no atomic increment, so the read and write run under a lock per OTP. The lock is local by
        /// default and distributed when Redis is configured
        /// </remarks>
        public async Task<int> IncrementVerifyAttemptsAsync(Guid operationId)
        {
            var attempts = 0;
            var acquired = await _lockFactory.DoExclusiveAsync(GetLockKey(operationId), LockExpiry, LockWait, LockRetry, async () =>
            {
                var dto = await GetAsync(operationId);
                if (dto == null)
                    return;

                dto.VerifyAttempts++;
                await SaveAsync(dto);
                attempts = dto.VerifyAttempts;
            });

            // another request for the same OTP holds the lock: fail closed, the caller treats this as over the limit
            return acquired ? attempts : int.MaxValue;
        }

        private static string GetLockKey(Guid operationId) => $"CacheOtpStorage:{operationId}";

        /// inheritedDoc
        public async Task<OtpDto> GetAsync(Guid operationId)
        {
            return await _otpCache.Cache.GetOrDefaultAsync(operationId);
        }
    }
}