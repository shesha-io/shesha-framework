using Abp.Runtime.Caching;
using Shesha.Cache;
using Shesha.Metadata.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shesha.Metadata
{
    /// <summary>
    ///  Base model provider
    /// </summary>
    public abstract class BaseModelProvider<TModel> : CacheHolder<string, List<TModel>>, IModelProvider where TModel : ModelDto
    {
        protected const string MainListCacheKey = "";

        protected BaseModelProvider(string cacheName, ICacheManager cacheManager) : base(cacheName, cacheManager)
        {
            Cache.DefaultSlidingExpireTime = TimeSpan.FromHours(24);
        }

        /// inheritedDoc
        public async Task<List<TModel>> GetModelsAsync()
        {
            return await Cache.GetAsync(MainListCacheKey, async (key) =>
            {
                var result = await FetchModelsAsync();

                return result;
            });
        }

        protected abstract Task<List<TModel>> FetchModelsAsync();

        /// inheritedDoc
        public async Task<Type?> GetModelTypeAsync(string nameOrAlias)
        {
            var models = await GetModelsAsync();
            return models.FirstOrDefault(m => m.Alias == nameOrAlias || m.FullClassName == nameOrAlias)?.Type;
        }

        public async Task ClearCacheAsync()
        {
            await Cache.ClearAsync();
        }

        async Task<List<ModelDto>> IModelProvider.GetModelsAsync()
        {
            var result = await GetModelsAsync();
            return result.Cast<ModelDto>().ToList();
        }
    }

    public abstract class BaseModelProvider : BaseModelProvider<ModelDto>
    {
        protected BaseModelProvider(string cacheName, ICacheManager cacheManager) : base(cacheName, cacheManager)
        {
        }
    }
}