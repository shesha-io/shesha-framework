using Abp.Runtime.Caching;
using Shesha.Cache;
using Shesha.Metadata.Dtos;
using Shesha.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Metadata
{
    /// <summary>
    ///  Base model provider
    /// </summary>
    public abstract class BaseModelProvider<TModel> : IModelProvider, IDisposable where TModel : ModelDto
    {
        private CacheHolder<string, List<TModel>> _modelsCacheHolder;
        private CacheHolder<string, string> _snapshotCacheHolder;

        protected const string MainListCacheKey = "";
        protected const string SnapshotCacheKey = "";

        private bool _disposed;

        protected BaseModelProvider(string cacheName, ICacheManager cacheManager)
        {
            _modelsCacheHolder = new CacheHolder<string, List<TModel>>(cacheName, cacheManager);
            _modelsCacheHolder.Cache.DefaultSlidingExpireTime = TimeSpan.FromHours(24);

            _snapshotCacheHolder = new CacheHolder<string, string>($"{cacheName}-md5", cacheManager);
            _snapshotCacheHolder.Cache.DefaultSlidingExpireTime = TimeSpan.FromHours(24);
        }

        /// inheritedDoc
        public async Task<ModelsResponse> GetModelsAsync()
        {
            var fetched = false;
            var models = await _modelsCacheHolder.Cache.GetAsync(MainListCacheKey, async (key) =>
            {
                fetched = true;
                return await FetchModelsAsync();
            });
            var snapshotHash = fetched
                ? await GetModelsSnapshotHashAsync(models)
                : await GetModelsSnapshotHashOrNullAsync() ?? await GetModelsSnapshotHashAsync(models);

            return new ModelsResponse(models, snapshotHash);
        }

        public virtual void Dispose()
        {
            if (_disposed)
                return;

            _disposed = true;

            _modelsCacheHolder.Dispose();
            _snapshotCacheHolder.Dispose();
        }

        protected abstract Task<List<TModel>> FetchModelsAsync();

        /// inheritedDoc
        public async Task<Type> GetModelTypeAsync(string nameOrAlias)
        {
            var modelsResponse = await GetModelsAsync();
            return modelsResponse.Models.FirstOrDefault(m => m.Alias == nameOrAlias || m.ClassName == nameOrAlias)?.Type;
        }

        public async Task ClearCacheAsync()
        {
            await _modelsCacheHolder.Cache.ClearAsync();
            await _snapshotCacheHolder.Cache.ClearAsync();
        }

        async Task<List<ModelDto>> IModelProvider.GetModelsListAsync()
        {
            var result = await GetModelsAsync();
            return result.Models.Cast<ModelDto>().ToList();
        }

        protected virtual void ThrowIfDisposed()
        {
            if (_disposed)
            {
                throw new ObjectDisposedException(GetType().FullName);
            }
        }

        public async Task<string> GetModelsSnapshotHashOrNullAsync()
        {
            var conditionalValue = await _snapshotCacheHolder.Cache.TryGetValueAsync(SnapshotCacheKey);
            return conditionalValue.HasValue
                ? conditionalValue.Value
                : null;
        }

        public Task<string> GetModelsSnapshotHashAsync(List<TModel> models) 
        {
            return _snapshotCacheHolder.Cache.GetAsync(SnapshotCacheKey, async () => await ComputeModelsSnapshotHashAsync(models));
        }

        public Task<string> ComputeModelsSnapshotHashAsync(List<TModel> dtos)
        {
            if (!typeof(IHasMD5).IsAssignableFrom(typeof(TModel)))
                return Task.FromResult("not-available");

            var typedDtos = dtos.OfType<IHasMD5>();
            var sb = new StringBuilder();
            foreach (var dto in typedDtos)
            {
                var md5 = dto.GetMD5();
                sb.Append(md5);
                sb.Append(",");
            }
            var hash = sb.ToString().ToMd5Fingerprint();

            return Task.FromResult(hash);
        }

        public class ModelsResponse
        {
            public List<TModel> Models { get; set; }
            public string SnapshotHash { get; set; }

            public ModelsResponse(List<TModel> models, string snapshotHash)
            {
                Models = models;
                SnapshotHash = snapshotHash;
            }
        }
    }

    public abstract class BaseModelProvider : BaseModelProvider<ModelDto>
    {
        protected BaseModelProvider(string cacheName, ICacheManager cacheManager) : base(cacheName, cacheManager)
        {
        }
    }
}