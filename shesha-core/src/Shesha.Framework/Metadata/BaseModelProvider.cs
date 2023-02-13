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
    public abstract class BaseModelProvider : IModelProvider
    {
        private readonly ICacheManager _cacheManager;

        /// <summary>
        /// Cache of the ReferenceListItems
        /// </summary>
        protected ITypedCache<string, List<ModelDto>> ModelsCache => _cacheManager.GetCache<string, List<ModelDto>>($"{this.GetType().Name}ModelsCache");

        public BaseModelProvider(ICacheManager cacheManager)
        {
            _cacheManager = cacheManager;
        }

        /// inheritedDoc
        public async Task<List<ModelDto>> GetModelsAsync()
        {
            var cacheKey = "";

            return await ModelsCache.GetAsync(cacheKey, async (key) =>
            {
                return await FetchModelsAsync();
            });
        }

        protected abstract Task<List<ModelDto>> FetchModelsAsync();

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
    }
}
