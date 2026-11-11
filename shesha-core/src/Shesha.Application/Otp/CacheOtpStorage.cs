using Shesha.Otp.Dto;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    /// <summary>
    /// Cache storage for one-time-pins
    /// </summary>
    public class CacheOtpStorage: IOtpStorage
    {
        // The cache has no atomic operations, so read-modify-write operations run under a lock. The lock is per
        // instance, like the in-memory cache this storage is normally used with
        private static readonly SemaphoreSlim Lock = new SemaphoreSlim(1, 1);

        private readonly IOtpCache _otpCache;

        /// <summary>
        /// Default constructor
        /// </summary>
        public CacheOtpStorage(IOtpCache otpCache)
        {
            _otpCache = otpCache;
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
        public async Task UpdateAsync(Guid operationId, Func<OtpDto, Task> updateAction)
        {
            await Lock.WaitAsync();
            try
            {
                var dto = await GetAsync(operationId);
                if (dto == null)
                    return;

                await updateAction.Invoke(dto);
                await SaveAsync(dto);
            }
            finally
            {
                Lock.Release();
            }
        }

        /// inheritedDoc
        public async Task<int> IncrementVerifyAttemptsAsync(Guid operationId)
        {
            await Lock.WaitAsync();
            try
            {
                var dto = await GetAsync(operationId);
                if (dto == null)
                    return 0;

                dto.VerifyAttempts++;
                await SaveAsync(dto);
                return dto.VerifyAttempts;
            }
            finally
            {
                Lock.Release();
            }
        }

        /// inheritedDoc
        public async Task<bool> TryConsumeAsync(Guid operationId)
        {
            await Lock.WaitAsync();
            try
            {
                var dto = await GetAsync(operationId);
                if (dto == null || dto.ConsumedOn.HasValue || dto.ExpiresOn.HasValue && dto.ExpiresOn.Value <= DateTime.Now)
                    return false;

                dto.ConsumedOn = DateTime.Now;
                await SaveAsync(dto);
                return true;
            }
            finally
            {
                Lock.Release();
            }
        }

        /// inheritedDoc
        public async Task<OtpDto> GetAsync(Guid operationId)
        {
            return await _otpCache.Cache.GetOrDefaultAsync(operationId);
        }
    }
}