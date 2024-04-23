using Abp.Runtime.Caching;
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
    public abstract class BaseModelProvider<TModel> : IModelProvider where TModel: ModelDto
    {
        protected const string MainListCacheKey = "";
        private readonly ICacheManager _cacheManager;

        /// <summary>
        /// Cache of the ReferenceListItems
        /// </summary>
        protected ITypedCache<string, List<TModel>> ModelsCache => _cacheManager.GetCache<string, List<TModel>>($"{this.GetType().Name}ModelsCache");

        public BaseModelProvider(ICacheManager cacheManager)
        {
            _cacheManager = cacheManager;
        }

        /// inheritedDoc
        public async Task<List<TModel>> GetModelsAsync()
        {
            return await ModelsCache.GetAsync(MainListCacheKey, async (key) =>
            {
                var result = await FetchModelsAsync();

                return result;
            });
        }

        protected abstract Task<List<TModel>> FetchModelsAsync();

        /// inheritedDoc
        public async Task<Type> GetModelTypeAsync(string nameOrAlias)
        {
            var models = await GetModelsAsync();
            return models.FirstOrDefault(m => m.Alias == nameOrAlias || m.ClassName == nameOrAlias)?.Type;
        }

        public async Task ClearCache()
        {
            await ModelsCache.ClearAsync();
        }

        async Task<List<ModelDto>> IModelProvider.GetModelsAsync()
        {
            var result = await GetModelsAsync();
            return result.Cast<ModelDto>().ToList();
        }
    }

    public abstract class BaseModelProvider : BaseModelProvider<ModelDto>
    {
        protected BaseModelProvider(ICacheManager cacheManager) : base(cacheManager)
        {
        }
    }
}
