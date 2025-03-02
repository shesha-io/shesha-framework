using Shesha.Otp.Dto;
using Shesha.Otp.Exceptions;
using System;
using System.Threading.Tasks;

namespace Shesha.Otp
{
    public class CacheOtpStorage : IOtpStorage
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
        public async Task<OtpDto?> GetOrNullAsync(Guid operationId)
        {
            return await _otpCache.Cache.GetOrDefaultAsync(operationId);
        }

        public async Task<OtpDto> GetAsync(Guid operationId)
        {
            return (await GetOrNullAsync(operationId)) ?? throw new OtpOperationNotFoundException(operationId);
        }
    }
}