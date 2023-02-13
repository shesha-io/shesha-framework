using System;
using System.Threading.Tasks;
using Abp.Runtime.Caching;
using Shesha.Otp.Dto;

namespace Shesha.Otp
{
    public class CacheOtpStorage: IOtpStorage
    {
        private const string CacheName = "OneTimePinsCache";
        private readonly ICacheManager _cacheManager;

        public CacheOtpStorage(ICacheManager cacheManager)
        {
            _cacheManager = cacheManager;
        }

        public ITypedCache<Guid, OtpDto> InternalCache => _cacheManager.GetCache<Guid, OtpDto>(CacheName);

        /// inheritedDoc
        public async Task SaveAsync(OtpDto input)
        {
            if (input.ExpiresOn.HasValue && input.ExpiresOn.Value <= DateTime.Now)
                return;

            await InternalCache.SetAsync(input.OperationId, 
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
        public async Task<OtpDto> GetAsync(Guid operationId)
        {
            return await InternalCache.GetOrDefaultAsync(operationId);
        }
    }
}
