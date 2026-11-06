using Shesha.Otp.Dto;
using System;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    public class CacheOtpStorage: IOtpStorage
    {
        private readonly IOtpCache _otpCache;

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
            var dto = await GetAsync(operationId);
            await updateAction.Invoke(dto);
            await SaveAsync(dto);
        }

        /// inheritedDoc
        /// <remarks>Not atomic: the cache has no compare-and-set, so concurrent requests may undercount attempts</remarks>
        public async Task<int> IncrementVerifyAttemptsAsync(Guid operationId)
        {
            var dto = await GetAsync(operationId);
            if (dto == null)
                return 0;

            dto.VerifyAttempts++;
            await SaveAsync(dto);
            return dto.VerifyAttempts;
        }

        /// inheritedDoc
        public async Task<OtpDto> GetAsync(Guid operationId)
        {
            return await _otpCache.Cache.GetOrDefaultAsync(operationId);
        }
    }
}